<template>
    <div class="chat">

        <div class="message-container" ref="container">
            <div v-for="message in messages">
                <q-chat-message v-if="message.sent" :name="message.from" :text="message.text" sent bg-color="grey-3"
                    class="clickable" @click="selectAsInput(message.text)" title="Click to type again" />
                <q-chat-message v-else :name="message.from" :text="message.text" :text-html="message.isHtml"
                    :avatar="avatar" bg-color="green-2" />
            </div>
        </div>
    </div>
    <div class="chat-input">

        <q-input bottom-slots v-model="text" label="Message" class="input" @keyup.enter="send" @keyup.up="previous"
            @keyup.down="next" ref="input" :disable="isAutomatic">
            <template v-slot:append>
                <q-icon v-if="text !== ''" name="close" class="cursor-pointer" @click="clearInput" />
            </template>

            <template v-slot:hint>
                Your command, question, or definition
            </template>

            <template v-slot:after>
                <q-btn v-if="text !== ''" round dense flat icon="send" @click="send" />
            </template>
        </q-input>

    </div>
</template>

<script setup>

import { ref, watch, nextTick, onMounted } from "vue"
import avatar from "../assets/robot-svgrepo-com.png"

defineExpose({
    print,
    enterInput,
    enterInputAndFocus,
    clear
})

const emits = defineEmits(['input'])
const props = defineProps(['inMessage', 'isAutomatic'])
const container = ref()
const history = ref([""])
const historyIndex = ref(0)

const text = ref("")
const messages = ref([])
const input = ref()

function clearInput() {
    text.value = ''
}

onMounted(() => {
    input.value.focus()
})

function clear() {
    messages.value = []
}

function enterInput(message) {
    text.value = message
    send()
}

function enterInputAndFocus(message) {
    text.value = message
    input.value.focus()
}

function print(message, isHtml) {
    addMessage({
        from: "NLI-GO client",
        text: [message],
        sent: false,
        isHtml: isHtml
    })
}

function send() {
    const input = text.value
    if (text.value !== "") {
        addMessage({
            from: "Me",
            text: [text.value],
            sent: true,
            isHtml: false
        })
        updateLastHistoryEntry()
        addToHistory("")
        clearInput()
        emits('input', input)
    }
}

function addToHistory(message) {
    history.value.push(message)
    historyIndex.value = history.value.length - 1
}

function updateLastHistoryEntry() {
    history.value[history.value.length - 1] = text.value
}

function previous() {
    // is this is last (current) entry?
    if (historyIndex.value === history.value.length - 1) {
        updateLastHistoryEntry()
    }

    if (historyIndex.value > 0) {
        historyIndex.value--
        text.value = history.value[historyIndex.value]
    }
}

function next() {
    if (historyIndex.value < history.value.length - 1) {
        historyIndex.value++
        text.value = history.value[historyIndex.value]
    }
}

function addMessage(message) {
    messages.value.push(message)
    scrollToBottom()
}

function scrollToBottom() {
    nextTick(() => {
        container.value.scrollTop = container.value.scrollHeight
    });
}

function selectAsInput(message) {
    text.value = message
    input.value.$el.focus()
}

</script>


<style scoped>
.chat {
    left: 0;
    right: 0;
    top: 0;
    bottom: 100px;
    position: absolute;
}

.chat-input {
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
}

.message-container {
    padding: 20px;
    /* https://stackoverflow.com/a/5048250 */
    position: absolute;
    bottom: 0px;
    right: 0px;
    left: 0px;
    overflow-y: auto;
    /* this is the key */
    max-height: 100%;
}


.input {
    margin: 10px;
}

.clickable {
    cursor: pointer;
}
</style>
