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
      const projectLinks = wrapper.findAll('router-link');
      expect(projectLinks.length).toBe(3);
      expect(projectLinks.map(l => l.attributes().to)).toContain('/projects/default');
      expect(projectLinks.map(l => l.attributes().to)).toContain('/projects/project1');
      expect(projectLinks.map(l => l.attributes().to)).toContain('/projects/project2');
      done()
    });
  });

});