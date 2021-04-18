from pathlib import Path, PurePath

from pydantic2ts import generate_typescript_defs

MODEL_FILENAMES = ["requests", "responses", "websocket"]


current_dir = Path(__file__).parent
json2ts_path = PurePath(current_dir / "node_modules/.bin/json2ts")


def yarn_install() -> None:
    pass


def generate(module_name: str) -> None:
    out_filename = PurePath(current_dir / module_name).with_suffix(".ts")
    generate_typescript_defs(f"server.models.{module_name}", out_filename, json2ts_path)


if __name__ == "__main__":
    yarn_install()

    for module_name in MODEL_FILENAMES:
        generate(module_name)
