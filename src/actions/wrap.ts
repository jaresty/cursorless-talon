import { Selection } from "vscode";
import { flatten } from "lodash";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../Types";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { decorationSleep } from "../editDisplayUtils";
import { performEditsAndUpdateSelections } from "../updateSelections";
import { selectionWithEditorFromPositions } from "../selectionUtils";

export default class Wrap implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const thatMark = flatten(
      await runOnTargetsForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, targets) => {
          const originalSelections = editor.selections;

          const selections = targets.flatMap((target) => [
            new Selection(
              target.selection.selection.start,
              target.selection.selection.start
            ),
            new Selection(
              target.selection.selection.end,
              target.selection.selection.end
            ),
          ]);

          const edits = selections.map((selection, index) => ({
            range: selection,
            text: index % 2 === 0 ? left : right,
            dontMoveOnEqualStart: index % 2 === 1,
          }));

          const [updatedOriginalSelections, updatedSelections] =
            await performEditsAndUpdateSelections(editor, edits, [
              originalSelections,
              selections,
            ]);

          editor.selections = updatedOriginalSelections;

          editor.setDecorations(
            this.graph.editStyles.justAdded.token,
            updatedSelections
          );
          await decorationSleep();

          editor.setDecorations(this.graph.editStyles.justAdded.token, []);

          return targets.map((target, index) => {
            const start = updatedSelections[index * 2].start;
            const end = updatedSelections[index * 2 + 1].end;
            return selectionWithEditorFromPositions(
              target.selection,
              start,
              end
            );
          });
        }
      )
    );

    return { returnValue: null, thatMark };
  }
}