import { mount } from '@vue/test-utils';
import HomePage from '@/components/HomePage.vue';

describe('HomePage.vue', () => {
    it('Home page renders', () => {
        const wrapper = mount(HomePage);
        console.log(wrapper.html());

    } );
});