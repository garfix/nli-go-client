export default (function () {

    const CLOSING = 2;
    const CLOSED = 3;

    let monitor
    let webSocket
    let printer
    let isClearFunction
    let isAutomaticFunction;

    function initialize(elementId, printerCallback, processlistClear, interactionAutomatic) {
        monitor = document.getElementById(elementId)
        printer = printerCallback
        isClearFunction = processlistClear
        isAutomaticFunction = interactionAutomatic

        const domain = location.hostname
        const protocol = location.protocol
        const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'

        webSocket = new WebSocket(wsProtocol + "//" + domain + "/ws_chat")
        webSocket.onopen = () => {
            processlistClear()
        }
        webSocket.onmessage = (event) => {
            handleIncomingMessage(JSON.parse(event.data))
        }

        document.addEventListener('click', event => {
            const element = event.target
            if (element.type === 'button' && element.dataset.option) {
                choice(element.dataset.option)
            }
        })
    }

    function handleIncomingMessage(message) {
        console.log("received", message)
        switch (message.MessageType) {
            case "print":
                const time = printer(message.Message, false)
                setTimeout(() => {
                    send("language", "acknowledge", "")
                }, time)
                break
            case "processlist_clear":
                isClearFunction()
                break
            case "choose":
                choose(message.Message[0], message.Message[1])
                break
            case "error":
                const msg = "<div class='error'>ERROR</div>" + message.Message
                printer(msg, true)
                break
        }
    }

    function handleInput(input) {
        send("language", "respond", input)
    }

    function choose(clarification, options) {
        let out = clarification
        let index = 0
        for (const option of options) {
            out += "<br><br>" + "<button type='button' data-option='" + index + "'>" + option + "</button>"
            index++
        }
        if (isAutomaticFunction()) {
            choice(1)
        }
    }

    function choice(index) {
        send("language", "choice", "" + index)
    }

    function send(resource, messageType, message) {
        console.log("send", messageType, message)
        if ([CLOSING, CLOSED].includes(webSocket.readyState)) {
            printer("Sorry, the connection to the server is closed. Reload the page for a new connection")
            return
        }
        webSocket.send(JSON.stringify({
            System: "blocks",
            Resource: resource,
            MessageType: messageType,
            Message: message
        }))
    }

    return {
        initialize,
        handleInput,
    }
})()
