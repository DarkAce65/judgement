import subprocess
from pathlib import Path, PurePath

from watchgod import watch
from watchgod.watcher import RegExpWatcher

from model_converter.model_converter import MODEL_FILENAMES, yarn_install

if __name__ == "__main__":
    yarn_install()

    model_filenames_to_watch = "|".join(MODEL_FILENAMES)

    for changes in watch(
        (Path(__file__).parent / "../server/models").resolve(),
        watcher_cls=RegExpWatcher,
        watcher_kwargs=dict(re_files=r"^.*(" + model_filenames_to_watch + r")\.py$"),
    ):
        for change in changes:
            (_, changed_file) = change
            changed_module_name = PurePath(changed_file).stem
            subprocess.run(
                [
                    "python",
                    "-c",
                    f'from model_converter.model_converter import generate; generate("{changed_module_name}")',
                ]
            )
