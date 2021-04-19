import argparse
import logging
import subprocess
from pathlib import Path, PurePath

from watchgod import watch
from watchgod.watcher import RegExpWatcher

from model_generator.model_generator import MODEL_MODULES, yarn_install


def run_generator(model_modules: list[str], out_dir: str) -> None:
    subprocess.run(
        [
            "python",
            "-m",
            "model_generator.model_generator",
            "--skip-yarn",
            *[arg for module in model_modules for arg in ("--module", module)],
            "--out_dir",
            out_dir,
        ],
        check=True,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-yarn", action="store_true")
    parser.add_argument("--out_dir", required=True)
    args = parser.parse_args()

    if not args.skip_yarn:
        yarn_install()

    watch_dir = (Path(__file__).parent / "../server/models").resolve()
    out_dir = args.out_dir

    logging.info("Generating models to %s...", out_dir)
    run_generator(MODEL_MODULES, out_dir)

    logging.info("Watching for changes in %s...", watch_dir)
    WATCHER_FILE_REGEX = r"^.*(" + "|".join(MODEL_MODULES) + r")\.py$"
    for changes in watch(
        watch_dir,
        watcher_cls=RegExpWatcher,
        watcher_kwargs=dict(re_files=WATCHER_FILE_REGEX),
    ):
        run_generator([PurePath(change[1]).stem for change in changes], out_dir)
