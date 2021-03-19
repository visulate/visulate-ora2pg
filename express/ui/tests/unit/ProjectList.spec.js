import { shallowMount, mount } from '@vue/test-utils'
import ProjectList from '@/components/ProjectList.vue'


global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({"projects": ["default", "project1", "project2"]})
  })
);

beforeEach(() => {
  fetch.mockClear();
});

describe('ProjectList.vue',() => {
  test('Project List renders', () => {
    const wrapper = shallowMount(ProjectList)
    expect(wrapper.html()).toContain('mdl-navigation')
  });

  test('ProjectList populated', (done) => {
    const wrapper = mount(ProjectList)
    setTimeout(() => {
      expect(wrapper.findAll('a').length).toBe(3)
      done()
    });
  });

  test('Select project from list', (done) => {
    const wrapper = mount(ProjectList)
    setTimeout(() => {
      wrapper.find('a').trigger('click')
      expect(wrapper.emitted()).toHaveProperty('set-project')
      done()
    });
  });

});