import logging
import subprocess
from pathlib import Path, PurePath

from watchgod import watch
from watchgod.watcher import RegExpWatcher

from model_generator.model_generator import MODEL_MODULES, yarn_install


def run_generator(model_modules: list[str]) -> None:
    subprocess.run(
        [
            "python",
            "-m",
            "model_generator.model_generator",
            "--skip-yarn",
            *[arg for module in model_modules for arg in ("--module", module)],
        ],
        check=True,
    )


if __name__ == "__main__":
    yarn_install()

    watch_dir = (Path(__file__).parent / "../server/models").resolve()

    logging.info("Generating models in %s...", watch_dir)
    run_generator(MODEL_MODULES)

    logging.info("Watching for changes in %s...", watch_dir)
    WATCHER_FILE_REGEX = r"^.*(" + "|".join(MODEL_MODULES) + r")\.py$"
    for changes in watch(
        watch_dir,
        watcher_cls=RegExpWatcher,
        watcher_kwargs=dict(re_files=WATCHER_FILE_REGEX),
    ):
        run_generator([PurePath(change[1]).stem for change in changes])
