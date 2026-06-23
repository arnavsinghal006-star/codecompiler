const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Compiler server running");
});

app.post("/compile", (req, res) => {
    try {
        const { code, lang, input } = req.body;

        if (!code) {
            return res.json({ error: "No code provided" });
        }

        // ================= PYTHON =================
        if (lang === "python") {

            fs.writeFileSync("temp.py", code);

            const cmd = process.platform === "win32" ? "python" : "python3";
            const run = spawn(cmd, ["temp.py"]);

            let output = "";
            let error = "";

            if (input) {
                run.stdin.write(input);
            }
            run.stdin.end();

            run.stdout.on("data", (data) => {
                output += data.toString();
            });

            run.stderr.on("data", (data) => {
                error += data.toString();
            });

            run.on("close", () => {
                if (error) return res.json({ error });
                res.json({ output });
            });
        }

        // ================= C++ =================
        else if (lang === "cpp") {

            fs.writeFileSync("temp.cpp", code);

            const exe = process.platform === "win32" ? "temp.exe" : "./temp";

            const compile = spawn("g++", ["temp.cpp", "-o", "temp"]);

            let compileError = "";

            compile.stderr.on("data", (data) => {
                compileError += data.toString();
            });

            compile.on("close", (code) => {

                if (code !== 0) {
                    return res.json({ error: compileError });
                }

                const run = spawn(exe);

                let output = "";
                let error = "";

                if (input) {
                    run.stdin.write(input);
                }
                run.stdin.end();

                run.stdout.on("data", (data) => {
                    output += data.toString();
                });

                run.stderr.on("data", (data) => {
                    error += data.toString();
                });

                run.on("close", () => {
                    if (error) return res.json({ error });
                    res.json({ output });
                });

            });
        }

        // ================= JAVA =================
        else if (lang === "java") {

            fs.writeFileSync("Main.java", code);

            const compile = spawn("javac", ["Main.java"]);

            let compileError = "";

            compile.stderr.on("data", (data) => {
                compileError += data.toString();
            });

            compile.on("close", (code) => {

                if (code !== 0) {
                    return res.json({ error: compileError });
                }

                const run = spawn("java", ["Main"]);

                let output = "";
                let error = "";

                if (input) {
                    run.stdin.write(input);
                }
                run.stdin.end();

                run.stdout.on("data", (data) => {
                    output += data.toString();
                });

                run.stderr.on("data", (data) => {
                    error += data.toString();
                });

                run.on("close", () => {
                    if (error) return res.json({ error });
                    res.json({ output });
                });

            });
        }

        else {
            res.json({ error: "Language not supported" });
        }

    } catch (err) {
        res.json({ error: "Server crashed: " + err.message });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});