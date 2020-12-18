app.component('configuration', {
    name: 'configuration',
    template:
    /*html*/
    `
    <div>
    <h3>{{ project }} Configuration</h3>
    <form @submit.prevent="onSubmit" v-show="Object.keys(this.configData).length > 0">
    <a v-show="showAdvanced" @click="setAdvanced(false)">Hide advanced settings</a>
    <a v-show="!showAdvanced" @click="setAdvanced(true)">Show advanced settings</a>
    <div v-for="(properties, section) in configData">
    <h3 class="accordion" @click="toggleAccordion(section)" v-show="properties.class == 'basic' || showAdvanced">{{ section }} - {{ properties.title }}</h3>
    <ul class="panel" :ref="section">
      <li v-for="(item, key) in properties.values" v-show="item.class == 'basic' || showAdvanced"><span class="tooltip">
          <label :for="key">{{ key }}</label>
          <div class="tip">
            <h5>{{ key }}</h5>{{ item.description }}
          </div>
        </span>
        <span>
          <select v-if="item.flag" v-model="item.value" :disabled="!item.include">
            <option value="0" >Disabled</option>
            <option value="1" >Enabled</option>
          </select>
          <select v-else-if="item.enum"  v-model="item.value" :disabled="!item.include">
            <option  v-for="validValue in item.enum" :value="validValue" >{{validValue}}</option>
          </select>
          <textarea v-else-if="item.value.length > 60" v-model="item.value" :disabled="!item.include"></textarea>
          <input v-else type="text" v-model="item.value" :disabled="!item.include" />
          <input class="checkbox" type="checkbox" v-model="item.include" />
        </span>
      </li>
    </ul>
    </div>

    <h3>Actions</h3>
    <ul>
      <li><input type="submit" value="Save" /></li>
    </ul>

    </form>
    </div>
    `,
    props: {
      project: {
        type: String
      },
      config: {
        type: Object
      }
    },
    data() {
      return {
        configData: {},
        showAdvanced: false
      }
    },
    beforeUpdate() {
      this.configData = {...this.config};
    },
    methods: {
      onSubmit() {
        this.$emit('save-config', {project: this.project, config: JSON.stringify(this.configData)});
      },
      setAdvanced(val) {
        this.showAdvanced = val
      },
      toggleAccordion(section){
        let panel = this.$refs[section];
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      }
    }

})