from talon import Module
from ..primitive_target import STRICT_HERE

mod = Module()
mod.list(
    "cursorless_source_destination_connective",
    desc="The connective used to separate source and destination targets",
)


mod.list("cursorless_move_bring_action", desc="Cursorless move or bring actions")


@mod.capture(
    rule=(
        "<user.cursorless_target> [{user.cursorless_source_destination_connective} <user.cursorless_target>]"
    )
)
def cursorless_move_bring_targets(m) -> str:
    target_list = m.cursorless_target_list

    if len(target_list) == 1:
        target_list = target_list + [STRICT_HERE]

    return target_list