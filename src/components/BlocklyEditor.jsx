import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator, Order } from "blockly/javascript";
import toolbox from "../utils/toolbox";
import "./styles.css";
import { FaPlay } from "react-icons/fa6";
import { RiResetLeftFill } from "react-icons/ri";
import { FaCode } from "react-icons/fa";


function BlocklyEditor() {
    const blocklyDiv = useRef(null);
    const [workspace, setWorkspace] = useState(null);
    const [output, setOutput] = useState("");

    useEffect(() => {
        Blockly.defineBlocksWithJsonArray([
            {
                type: "console_log",
                message0: "log %1",
                args0: [
                    {
                        type: "input_value",
                        name: "TEXT",
                    },
                ],
                previousStatement: null,
                nextStatement: null,
                colour: 160,
                tooltip: "Log text to the console",
                helpUrl: "",
            },
        ]);

        // Register the JavaScript generator for console_log block
        javascriptGenerator.forBlock["console_log"] = function (block) {
            const text =
                javascriptGenerator.valueToCode(
                    block,
                    "TEXT",
                    javascriptGenerator.ORDER_NONE
                ) || '""';
            return `console.log(${text});\n`;
        };
    }, []);

    useEffect(() => {
        if (blocklyDiv.current) {
            const workspaceInstance = Blockly.inject(blocklyDiv.current, {
                toolbox: toolbox,
                zoom: {
                    controls: true,
                    wheel: true,
                    startScale: 1.0,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2,
                    pinch: true,
                },
                trashcan: true,
            });

            setWorkspace(workspaceInstance);
        }
    }, []);

    const runCode = () => {
        try {
            const code = javascriptGenerator.workspaceToCode(workspace);
            // ---------------- for printing the output in console --------------
            // eval(code); // this prints the code to the console
            // we can add code to any new state to keep to track of generated code.
            // setOutput(code);

            // ---------------- for printing the output in output area --------------
            // Create a new function that captures console.log output
            let output = [];
            const originalConsoleLog = console.log;
            console.log = (...args) => {
                output.push(args.join(" "));
                originalConsoleLog.apply(console, args);
            };

            // first create a anonymus funtion and then Immediately invoke the generated code
            new Function(code)();

            // Restore original console.log
            console.log = originalConsoleLog;

            setOutput(output.join("\n") || "No output");
        } catch (e) {
            setOutput("Error: " + e.message);
            console.log(e);
        }
    };

    const resetWorkspace = () => {
        workspace?.clear();
    };


    return (
        <div className="flex p-4 overflow-hidden">
            {/* Working area  */}

            <main className="flex flex-col w-9/12 ">
                <div className="flex justify-start items-center mb-4 pt-2">
                    <h1 className="lg:text-3xl md:text-xl font-bold ">Blockly Editor</h1>
                    <div className="flex gap-4 m-auto">
                        <button
                            onClick={runCode}
                            className="flex justify-center items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-700 active:bg-blue-900 text-white lg:px-4 lg:py-2 md:px-2 md:py-1  md:text-sm rounded"
                        >
                            <FaPlay />
                            Run code
                        </button>
                        <button
                            onClick={resetWorkspace}
                            className="flex justify-center items-center gap-2 cursor-pointer bg-red-500 hover:bg-red-700 active:bg-red-900 text-white lg:px-4 lg:py-2 md:px-2 md:py-1 md:text-sm rounded"
                        >
                            <RiResetLeftFill />
                            Reset
                        </button>
                    </div>
                </div>
                <div
                    ref={blocklyDiv}
                    className="h-[660px] "
                ></div>
            </main>

            {/* Output area */}
            <div className="ml-4 w-3/12 ">
                <h1 className="  flex justify-center items-center pt-2 lg:text-3xl md:text-xl font-bold mb-4 ">Output</h1>
                <div className="rounded-md output h-[660px] border border-gray-300 p-3 overflow-y-scroll font-mono bg-white">
                    {output ? (
                        output
                    ) : (
                        <span className="text-gray-500">Output shows here</span>
                    )}
                </div>
            </div>
        </div>
    );
}
export default BlocklyEditor;
