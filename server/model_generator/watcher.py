import argparse
import json
import logging
import logging.config
import subprocess
from pathlib import Path, PurePath
from subprocess import CalledProcessError
from typing import Optional

from watchgod import watch
from watchgod.watcher import RegExpWatcher

from model_generator.model_generator import MODEL_MODULES

logger = logging.getLogger(__name__)


def get_dotted_module_name(base_path: PurePath, path: str) -> str:
    return str(PurePath(path).relative_to(base_path).with_suffix("")).replace("/", ".")


def run_generator(
    out_dir: str,  # pylint: disable=redefined-outer-name
    module_names: Optional[list[str]] = None,
) -> None:
    generator_args = [
        "python",
        "-m",
        "model_generator.model_generator",
        "--out_dir",
        out_dir,
    ]

    if module_names is not None:
        for module_name in module_names:
            generator_args.extend(["--module", module_name])

    try:
        subprocess.run(generator_args, check=True)
    except CalledProcessError:
        logger.exception("Failed to process models: %s", generator_args)


if __name__ == "__main__":
    with open("logging.config.json") as config:
        logging.config.dictConfig(json.load(config))

    parser = argparse.ArgumentParser()
    parser.add_argument("--out_dir", required=True)
    args = parser.parse_args()

    watch_dir = (Path(__file__).parent.parent).resolve()
    out_dir = args.out_dir

    logging.info("Generating models to %s...", out_dir)
    run_generator(out_dir)

    logging.info("Watching for changes in %s...", watch_dir)
    module_paths = [module.replace(".", "/") for module in MODEL_MODULES]
    WATCHER_FILE_REGEX = r"^.*(" + "|".join(module_paths) + r")\.py$"
    for changes in watch(
        watch_dir,
        watcher_cls=RegExpWatcher,
        watcher_kwargs=dict(re_files=WATCHER_FILE_REGEX),
    ):
        run_generator(
            out_dir, [get_dotted_module_name(watch_dir, change[1]) for change in changes]
        )
