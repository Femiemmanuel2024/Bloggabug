import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '@/components/LoginPage.vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/components/supabase';

// Mocking vue-router
const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}));

// Mocking supabase
vi.mock('@/components/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnValue({
      data: null,
      error: { message: 'Invalid login' },
    }),
  },
}));

describe('LoginPage.vue', () => {
  it('displays "Wrong Details" on invalid login', async () => {
    const wrapper = mount(LoginPage);
    wrapper.find('input[type="text"]').setValue('invaliduser');
    wrapper.find('input[type="password"]').setValue('wrongpassword');
    await wrapper.find('form').trigger('submit.prevent');

    // Wait for the DOM to update
    await wrapper.vm.$nextTick();

    const button = wrapper.find('.btn-invalid');
    expect(button.exists()).toBe(true);

    if (button.exists()) {
      expect(button.text()).toBe('Wrong Details');
    }
  });

  it('redirects to /home on successful login', async () => {
    // Adjust the mock return value to simulate a successful login
    (supabase.from().select().or().single as jest.Mock).mockReturnValueOnce({
      data: {
        id: '1',
        email: 'user@example.com',
        password: 'correctpassword',
      },
      error: null,
    });

    const wrapper = mount(LoginPage);
    wrapper.find('input[type="text"]').setValue('user@example.com');
    wrapper.find('input[type="password"]').setValue('correctpassword');
    await wrapper.find('form').trigger('submit.prevent');

    // Wait for the DOM to update
    await wrapper.vm.$nextTick();

    expect(push).toHaveBeenCalledWith({ path: '/home' });
  });
});
