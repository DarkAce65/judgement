import argparse
import logging
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", action="append", dest="modules")
    parser.add_argument("--out_dir", required=True)
    args = parser.parse_args()

    module_names = args.modules
    if module_names is None:
        module_names = MODEL_MODULES

    out_dir = PurePath(args.out_dir)

    current_dir = Path(__file__).parent
    json2ts_path = PurePath(current_dir / "node_modules/.bin/json2ts")

    for module_name in module_names:
        out_filename = (out_dir / module_name).with_suffix(".ts")
        generate_typescript_defs(
            f"server.models.{module_name}", out_filename, json2ts_path
        )

        logger.info(
            "Wrote interfaces for server.models.%s to %s", module_name, out_filename
        )
