from __future__ import annotations

import logging
import sys
from typing import Any


class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        # Simple structured-like formatting for terminal
        level = record.levelname.ljust(8)
        time = self.formatTime(record, self.datefmt)
        msg = record.getMessage()
        
        # Capture extra fields if present
        extra = ""
        if hasattr(record, "extra_fields") and record.extra_fields:
            if isinstance(record.extra_fields, dict):
                extra = " | " + " ".join(f"{k}={v}" for k, v in record.extra_fields.items())
            else:
                extra = f" | {record.extra_fields}"
        
        return f"{time} | {level} | {record.name} | {msg}{extra}"


def setup_logger(name: str = "algoquest") -> logging.Logger:
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            StructuredFormatter(datefmt="%Y-%m-%dT%H:%M:%S")
        )
        logger.addHandler(handler)
        # Prevent propagation to root logger to avoid duplicate logs in some environments
        logger.propagate = False
        
    return logger


# Global logger instance
logger = setup_logger()


def log_info(msg: str, **kwargs: Any) -> None:
    logger.info(msg, extra={"extra_fields": kwargs})


def log_error(msg: str, **kwargs: Any) -> None:
    logger.error(msg, extra={"extra_fields": kwargs})


def log_warning(msg: str, **kwargs: Any) -> None:
    logger.warning(msg, extra={"extra_fields": kwargs})
