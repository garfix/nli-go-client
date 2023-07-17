<template>
     <div class="q-pa-md q-gutter-sm logger">
        <q-tree :nodes="nodes" node-key="label" />
    </div>
</template>

<script setup>

import { ref } from 'vue'

const nodes = ref([])

const nodesById = {}

defineExpose({
    addLogMessage
})

function addLogMessage(message) {
    const {Message, MessageType, Id, ParentId} = message;

    const node = {
        label: Message,
        children: [],
        icon: 'star',
    }

    if (nodesById[ParentId]) {
        nodesById[ParentId].children.push(node)
    } else {
        nodes.value.push(node)
    }

    nodesById[Id] = node
}

</script>

<style>
.logger {
    height: 100%;
    overflow: auto
}
</style>