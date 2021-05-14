import { shallowMount } from '@vue/test-utils'
import HomePage from '@/components/HomePage.vue'

describe('HomePage.vue',() => {
  test('Home page renders', () => {
    const wrapper = shallowMount(HomePage)
    expect(wrapper.html()).toContain('Visulate Ora2Pg')
    expect(wrapper.html()).toContain('Create a new project')
  });

  test('Enter project name', async () => {
    const wrapper = shallowMount(HomePage)
    const input = wrapper.find('input')
    await input.setValue('new-project-name')
    expect(input.element.value).toBe('new-project-name')
  });

  test('Submit form using enter key', async () => {
    const wrapper = shallowMount(HomePage)
    const input = wrapper.find('input')
    await input.setValue('new-project-name')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted()).toHaveProperty('create-project')
  });

  test('Submit form using button click', async () => {
    const wrapper = shallowMount(HomePage)
    await wrapper.find('input').setValue('new-project-name')

    await wrapper.find('#hp-create').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('create-project')
  });

  test('Cancel form using button click', async () => {
    const wrapper = shallowMount(HomePage)
    await wrapper.find('#hp-cancel').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('cancel-create-project')
  });
});
