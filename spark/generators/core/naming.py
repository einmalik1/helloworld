"""Shared naming helpers for generators."""

from __future__ import annotations

import re


def pascal(name: str) -> str:
    return "".join(p[:1].upper() + p[1:] for p in re.split(r"[_\s]+", name) if p)


def kebab(name: str) -> str:
    return re.sub(r"[_\s]+", "-", name.strip()).lower()
