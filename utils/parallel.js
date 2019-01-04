const { exec } = require('child_process');

module.exports = function parallelRun(commandArray, workerNumber = 4) {
    var index = 0;
    var finishedCount = 0;
    var succeedCount = 0;
    var failedArray = [];
    const start = Date.now()

    for (var i = 0; i < workerNumber; i++) {
        queueNewTask()
    }

    async function queueNewTask() {
        // do something
        if (index == commandArray.length) {
            if (finishedCount == commandArray.length) {
                const end = Date.now()
                console.log('')
                console.log(`All task finished, runtime ${end - start} ms`)
                console.log("  Result:")
                console.log(`    Succeed: ${succeedCount}/${commandArray.length}`)
                console.log(`    Failed: ${failedArray.length}/${commandArray.length}. Detail:`)
                failedArray.forEach(command => {
                    console.log("      " + command)
                })
            }
            return
        }
        var command = commandArray[index].command;
        var commandName = commandArray[index].name;
        index++;
        console.log(`Start to run command ${command}`)
        exec(command, (error, stdout, stderr) => {
            if (error) {
                failedArray.push(commandName)
                console.error(`Task ${finishedCount + 1}/${commandArray.length} "${command}" failed, detail: ${error.message}`);
            } else {
                succeedCount++
                console.log(`Task ${finishedCount + 1}/${commandArray.length} "${command}" finished`)
            }

            finishedCount++;
            queueNewTask()
        });
    }
}
