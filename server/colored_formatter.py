import logging
from typing import Any

BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE = range(8)
RESET_SEQ = "\033[0m"
COLOR_SEQ = "\033[1;%dm"
COLORS = {"DEBUG": BLUE, "INFO": WHITE, "WARNING": YELLOW, "CRITICAL": RED, "ERROR": RED}


class ColoredFormatter(logging.Formatter):
    def __init__(self, fmt: str, use_color: bool = True, **kwargs: Any) -> None:
        logging.Formatter.__init__(self, fmt, **kwargs)
        self.use_color = use_color

    def format(self, record: logging.LogRecord) -> str:
        levelname = record.levelname
        if self.use_color and levelname in COLORS:
            levelname_color = COLOR_SEQ % (30 + COLORS[levelname]) + levelname + RESET_SEQ
            record.levelname = levelname_color
        return logging.Formatter.format(self, record)
