import argparse
import importlib
import inspect
import json
import logging
import logging.config
import random
import string
import subprocess
from pathlib import Path, PurePath
from tempfile import NamedTemporaryFile
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict, create_model
from pydantic.json_schema import GenerateJsonSchema
from pydantic_core.core_schema import ModelSchema
from watchfiles import watch

TEMPORARY_MODEL_NAME = "_" + "".join(random.choices(string.ascii_uppercase, k=10)) + "_"


MODEL_MODULES: dict[str, str] = {
    "judgement": "server.models.judgement",
    "requests": "server.models.requests",
    "responses": "server.models.responses",
    "websocket": "server.models.websocket",
}

logger = logging.getLogger(__name__)


def is_pydantic_model(obj: Any) -> bool:
    if not inspect.isclass(obj):
        return False

    if obj is BaseModel:
        return False

    return issubclass(obj, BaseModel)


class CustomGenerateJsonSchema(GenerateJsonSchema):
    def field_title_should_be_set(self, schema: Any) -> bool:
        return False

    def model_schema(self, schema: ModelSchema) -> Dict[str, Any]:
        model_schema = super().model_schema(schema)
        if "additionalProperties" not in model_schema:
            model_schema["additionalProperties"] = False

        return model_schema


def get_schema(module_path: str) -> str:
    module = importlib.reload(importlib.import_module(module_path))

    models: dict[str, Any] = {
        model.__name__: (model, ...)
        for _, model in inspect.getmembers(module, is_pydantic_model)
    }
    parent_model = create_model(
        TEMPORARY_MODEL_NAME, __config__=ConfigDict(extra="forbid"), **models
    )
    return json.dumps(
        parent_model.model_json_schema(schema_generator=CustomGenerateJsonSchema)
    )


def write_schema(out_filename: PurePath, schema: str) -> None:
    current_dir = Path(__file__).parent
    json2ts_path = PurePath(current_dir / "node_modules/.bin/json2ts")

    with NamedTemporaryFile(mode="w+") as file:
        file.write(schema)
        file.flush()
        try:
            subprocess.run(
                (json2ts_path, "-i", file.name, "-o", out_filename), check=True
            )
        except subprocess.CalledProcessError as e:
            file.close()
            raise RuntimeError("json2ts failed to run") from e

    with open(out_filename, "r+", encoding="utf-8") as file:
        lines = file.readlines()
        file.seek(0)

        skip = False
        for line in lines:
            if f"interface {TEMPORARY_MODEL_NAME}" in line:
                skip = True

            if not skip:
                file.write(line)

            if skip and line.rstrip() == "}":
                skip = False

        file.truncate()


def generate_typescript_defs(
    out_filename: PurePath, module_path: str, raise_on_error: bool = True
) -> None:
    try:
        schema = get_schema(module_path)
        write_schema(out_filename, schema)
        logger.info("Wrote interfaces for %s to %s", module_path, out_filename)
    except RuntimeError as e:
        logger.exception("Failed to process models: %s", module_path)
        if raise_on_error:
            raise e


if __name__ == "__main__":
    with open("logging.config.json", encoding="utf-8") as config:
        logging.config.dictConfig(json.load(config))

    parser = argparse.ArgumentParser()
    parser.add_argument("--out_dir", type=str, required=True)
    parser.add_argument("--watch", action="store_true")
    args = parser.parse_args()

    out_dir = PurePath(args.out_dir)
    model_files: dict[str, tuple[str, PurePath]] = {}
    for module_name, module_path in MODEL_MODULES.items():
        module_file_path = importlib.import_module(module_path).__file__
        if module_file_path is not None:
            model_files[module_file_path] = (
                module_path,
                (out_dir / module_name).with_suffix(".ts"),
            )

    for module_file_path, (module_path, out_filename) in model_files.items():
        generate_typescript_defs(out_filename, module_path, not args.watch)

    if args.watch:
        for changes in watch(*model_files.keys()):
            for _, changed_file in changes:
                module_path, out_filename = model_files[changed_file]
                generate_typescript_defs(out_filename, module_path, not args.watch)
