import argparse
import logging
import subprocess
from pathlib import Path, PurePath

from pydantic2ts import generate_typescript_defs

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logging.getLogger("pydantic2ts").propagate = False

logger = logging.getLogger(__name__)





MODEL_MODULES = ["requests", "responses", "websocket"]



project_root = Path().resolve().parent
current_dir = Path(__file__).parent
json2ts_path = PurePath(current_dir / "node_modules/.bin/json2ts")


def yarn_install() -> None:
    subprocess.run(
        ["yarn", "install", "--silent", "--check-files"], check=True, cwd=current_dir
    )


def generate(module_name: str) -> None:
    out_filename = PurePath(current_dir / module_name).with_suffix(".ts")
    try:
        generate_typescript_defs(
            f"server.models.{module_name}", out_filename, json2ts_path
        )

        logger.info(
            "Wrote interfaces for server.models.%s to %s",
            module_name,
            out_filename.relative_to(project_root),
        )
    except:  # pylint: disable=bare-except
        logger.exception("Failed to process models in server.models.%s", module_name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-yarn", action="store_true")
    parser.add_argument("--module", action="append", dest="modules")
    args = parser.parse_args()

    module_names = args.modules
    if module_names is None:
        module_names = MODEL_MODULES

    if not args.skip_yarn:
        yarn_install()

    for module_name in args.modules:
        generate(module_name)
