import { useState, useRef } from "react";

const defaultSheet = Array(10)
  .fill(null)
  .map(() => Array(10).fill({ value: "", style: {} }));

const Sheet = () => {
  const [sheet, setSheet] = useState(defaultSheet);
  const [suggestion, setSuggestion] = useState("");
  const [activeCell, setActiveCell] = useState({ rowId: -1, colId: -1 });

  const cellRefs = useRef(
    Array(sheet.length)
      .fill(null)
      .map(() => Array(sheet?.[0].length).fill(null))
  );

  const handleUpdateSheet = (rowId, colId, key, value) => {
    const newSheet = sheet.map((row, rIndex) => {
      if (rIndex === rowId) {
        const updatedRow = row.map((col, cIndex) => {
          if (cIndex === colId) {
            return {
              ...col,
              [key]: value,
            };
          } else {
            return col;
          }
        });
        return updatedRow;
      } else {
        return row;
      }
    });
    setSheet(newSheet);
  };
  const handleSuggestion = (colId, value) => {
    if (value.length === 0) {
      setSuggestion("");
    }
    let suggestions = [];
    sheet.map((row) => {
      row.map((col, cIndex) => {
        if (cIndex === colId) {
          suggestions.push(col.value);
        }
      });
    });

    const suggestedValue = suggestions.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestion(suggestedValue[0]);
  };
  const handleInputChange = (e, rowId, colId) => {
    const value = e.target.value;
    handleUpdateSheet(rowId, colId, "value", value);
    handleSuggestion(colId, value);
  };
  const handleFocusChange = (rowId, colId) => {
    setActiveCell({ rowId, colId });
    setSuggestion("");
  };
  const handleKeyPress = (e, rowId, colId) => {
    if (!activeCell) return;
    let nextCell = null;
    switch (e.key) {
      case "ArrowUp":
        if (rowId === 0) break;
        else {
          nextCell = cellRefs.current[rowId - 1][colId];
        }
        break;
      case "ArrowDown":
        if (rowId === sheet.length - 1) break;
        else {
          nextCell = cellRefs.current[rowId + 1][colId];
        }
        break;
      case "ArrowLeft":
        if (colId === 0) break;
        else {
          nextCell = cellRefs.current[rowId][colId - 1];
        }
        break;
      case "ArrowRight":
        if (colId === sheet[0].length - 1) break;
        else {
          nextCell = cellRefs.current[rowId][colId + 1];
        }
        break;
      default:
        break;
    }

    if (nextCell) {
      nextCell.focus();
    }
  };

  const handleActions = (key, value) => {
    if (activeCell.rowId === -1 || activeCell.colId === -1) return;

    const currentCell = sheet[activeCell?.rowId]?.[activeCell?.colId];
    const currentStyle = currentCell.style;

    const updatedStyle = {
      ...currentStyle,
      [key]: currentStyle?.[key] === value ? "" : value,
    };
    handleUpdateSheet(
      activeCell?.rowId,
      activeCell?.colId,
      "style",
      updatedStyle
    );
  };

  const handleAddRow = () => {
    const updateSheet = [
      ...sheet,
      Array(sheet[0].length).fill({ value: "", style: {} }),
    ];
    setSheet(updateSheet);
    cellRefs.current = [...cellRefs.current, Array(sheet[0].length).fill(null)];
  };
  const handleAddColumn = () => {
    const updateSheet = sheet.map((item) => [
      ...item,
      { value: "", style: {} },
    ]);
    setSheet(updateSheet);
    cellRefs.current = cellRefs.current.map((item) => [...item, null]);
  };
  const handleUndo = () => {};
  const handleRedo = () => {};

  const handleGetState = (key, value) => {
    if (activeCell.rowId === -1 || activeCell.colId === -1) return;
    const { rowId, colId } = activeCell;
    const cellStyle = sheet[rowId][colId].style;
    if (cellStyle[key] === value) {
      return true;
    }
    return false;
  };

  return (
    <div className="editor">
      <div className="header">
        <div className="actions">
          <button
            className={
              handleGetState("font-weight", "bold") ? "selected_button" : ""
            }
            onClick={() => handleActions("font-weight", "bold")}
          >
            B
          </button>
          <button
            className={
              handleGetState("font-style", "italic") ? "selected_button" : ""
            }
            onClick={() => handleActions("font-style", "italic")}
          >
            I
          </button>
          <button
            className={
              handleGetState("text-decoration", "underline")
                ? "selected_button"
                : ""
            }
            onClick={() => handleActions("text-decoration", "underline")}
          >
            U
          </button>
          <button
            className={
              handleGetState("text-align", "left") ? "selected_button" : ""
            }
            onClick={() => handleActions("text-align", "left")}
          >
            Left-Align
          </button>
          <button
            className={
              handleGetState("text-align", "center") ? "selected_button" : ""
            }
            onClick={() => handleActions("text-align", "center")}
          >
            Center-Align
          </button>
          <button
            className={
              handleGetState("text-align", "right") ? "selected_button" : ""
            }
            onClick={() => handleActions("text-align", "right")}
          >
            Right-Align
          </button>
          <button className="add_row" onClick={handleAddRow}>
            Add Row
          </button>
          <button className="add_column" onClick={handleAddColumn}>
            Add Column
          </button>
          <button className="undo" onClick={handleUndo}>
            {"<"}
          </button>
          <button className="redo" onClick={handleRedo}>
            {">"}
          </button>
        </div>
      </div>
      <div className="sheet">
        <div className="pannel">
          <div className="unity_box"></div>
          <div className="row_header">
            {Array(sheet.length)
              .fill(null)
              .map((_, rowIndex) => {
                return (
                  <div className="row_header_cell" key={`row_${rowIndex}`}>
                    {rowIndex + 1}
                  </div>
                );
              })}
          </div>
        </div>
        <div className="pannel">
          <div className="column_header">
            {Array(sheet[0].length)
              .fill(null)
              .map((_, columnIndex) => {
                return (
                  <div
                    className="column_header_cell"
                    key={`col_${columnIndex}`}
                  >
                    {columnIndex + 1}
                  </div>
                );
              })}
          </div>
          <div className="sheet_render">
            {sheet.map((row, rowIndex) => {
              return (
                <div className="sheet_row" key={`row_${rowIndex}`}>
                  {row.map((cell, cellIndex) => {
                    return (
                      <div className="cell" key={`${rowIndex}_${cellIndex}`}>
                        <input
                          ref={(el) =>
                            (cellRefs.current[rowIndex][cellIndex] = el)
                          }
                          type="text"
                          style={cell.style}
                          className={
                            activeCell &&
                            activeCell?.rowId === rowIndex &&
                            activeCell?.colId === cellIndex
                              ? "active cell_input"
                              : "cell_input"
                          }
                          value={cell?.value}
                          onChange={(e) =>
                            handleInputChange(e, rowIndex, cellIndex)
                          }
                          onFocus={() => handleFocusChange(rowIndex, cellIndex)}
                          onKeyDown={(e) =>
                            handleKeyPress(e, rowIndex, cellIndex)
                          }
                        />
                        {activeCell &&
                          activeCell?.rowId === rowIndex &&
                          activeCell?.colId === cellIndex && (
                            <input
                              type="text"
                              value={suggestion}
                              style={cell.style}
                              className="suggestion"
                            />
                          )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sheet;
