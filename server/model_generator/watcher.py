import argparse
import logging
import subprocess
from pathlib import Path, PurePath
from subprocess import CalledProcessError
from typing import Optional

from watchgod import watch
from watchgod.watcher import RegExpWatcher

from model_generator.model_generator import MODEL_MODULES

logger = logging.getLogger(__name__)


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
        logger.exception("Failed to process models in server.models.%s", module_name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out_dir", required=True)
    args = parser.parse_args()

    watch_dir = (Path(__file__).parent / "../server/models").resolve()
    out_dir = args.out_dir

    logging.info("Generating models to %s...", out_dir)
    run_generator(out_dir)

    logging.info("Watching for changes in %s...", watch_dir)
    WATCHER_FILE_REGEX = r"^.*(" + "|".join(MODEL_MODULES) + r")\.py$"
    for changes in watch(
        watch_dir,
        watcher_cls=RegExpWatcher,
        watcher_kwargs=dict(re_files=WATCHER_FILE_REGEX),
    ):
        run_generator(out_dir, [PurePath(change[1]).stem for change in changes])
