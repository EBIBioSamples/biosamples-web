<template>
    <table>
        <thead>
            <tr>
                <th>Accession <button @click="sort(accession)"></button></th>
                <th>Organism</th>
                <th>Name</th>
                <th>Description</th>
                <th>Database</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in items">
                <td>{{item.accession}}</td>
                <td>{{item.organism}}</td>
                <td>{{item.name}}</td>
                <td>{{item.description}}</td>
                <td>{{item.database}}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    export default {
        props: {
            items: {
                type: Array,
                default: []
            }
        },
        computed: {
            hasItems() {
                return this.items.length > 0;
            }
        },

        methods: {
            sort(sortType) {
                console.log(`Sorted by ${sortType}`);
            }
        }
    }

    dataFactory = function() {
        return [{
                accession: "",
                organism: "",
                name: "",
                description: "",
                database: ""
            }]
    }
</script>