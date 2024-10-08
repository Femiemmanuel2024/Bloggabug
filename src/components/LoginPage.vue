<template>
  <div class="loginbody">
    <div class="columns-container">
      <div class="column left-column">
        <div class="image-container">
          <img src="/Signinsvg.svg" alt="Sign In" class="signin-image" />
        </div>
        <h1>Welcome to Blugbug</h1>
        <p>
          We're excited to have you join our vibrant community. Connect with
          friends, share your thoughts, and explore new ideas. Happy Blugging!
        </p>
      </div>
      <div class="column right-column">
        <div class="login-container">
          <h1>Login</h1>
          <form @submit.prevent="onSubmit">
            <div class="form-group">
              <input
                class="input-bar"
                type="text"
                placeholder="Email Address or Blugger Name"
                v-model="username"
                required
              />
            </div>
            <div class="form-group password-group">
              <input
                :type="passwordFieldType"
                placeholder="Password"
                v-model="password"
                required
              />
              <i :class="passwordFieldIcon" @click="togglePasswordVisibility"></i>
            </div>
            <!-- Forgot Password and Help Links Container -->
            <div class="links-container">
              <p class="forgot-password" @click="showForgotPasswordModal">Forgot Password?</p>
              <p class="help-text" @click="toggleLoginLogComplainModal">Help</p>
            </div>
            <button
              type="submit"
              :class="['btn', isInvalidLogin ? 'btn-invalid' : 'btn-login']"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Logging in...' : isInvalidLogin ? 'Wrong Details' : 'Login' }}
            </button>
          </form>
          <p>
            Don't have an account?
            <router-link to="/signup">Sign Up</router-link>
          </p>
        </div>
      </div>
    </div>
    <!-- Password Recovery Modal -->
    <PasswordRecovery :showModal="showPasswordRecovery" @close="showPasswordRecovery = false" />
    <!-- LogComplaint Modal -->
    <LogComplaint 
      v-if="showLoginLogComplainModal" 
      :showModal="showLoginLogComplainModal" 
      @close="toggleLoginLogComplainModal" 
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import PasswordRecovery from '../components/v2.0/PasswordRecovery.vue';
import LogComplaint from '../components/v2.0/LogComplaint.vue'; // Import the LogComplaint component

export default defineComponent({
  name: 'LoginPage',
  components: {
    PasswordRecovery,
    LogComplaint, // Register the LogComplaint component
  },
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const passwordFieldType = ref('password');
    const passwordFieldIcon = ref('fas fa-eye');
    const isInvalidLogin = ref(false);
    const isLoading = ref(false);
    const showPasswordRecovery = ref(false);
    const showLoginLogComplainModal = ref(false); // New reactive property for controlling LogComplaint modal in LoginPage

    const onSubmit = async () => {
      isLoading.value = true;
      isInvalidLogin.value = false;

      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, password')
          .or(`email.eq.${username.value},chatter_name.eq.${username.value}`)
          .single();

        if (error || !user) {
          isInvalidLogin.value = true;
          setTimeout(() => {
            isInvalidLogin.value = false;
          }, 2000);
          return;
        }

        // First, try bcrypt password comparison
        const passwordMatches = await bcrypt.compare(password.value, user.password);

        if (!passwordMatches) {
          // If bcrypt comparison fails, check if the password matches as plain text
          if (password.value !== user.password) {
            isInvalidLogin.value = true;
            setTimeout(() => {
              isInvalidLogin.value = false;
            }, 2000);
            return;
          }
        }

        localStorage.setItem('currentUser', JSON.stringify({ id: user.id, email: user.email }));
        router.push({ path: '/home' });
      } catch (err: any) {
        alert(`Unexpected error: ${err.message}`);
      } finally {
        isLoading.value = false;
      }
    };

    const togglePasswordVisibility = () => {
      if (passwordFieldType.value === 'password') {
        passwordFieldType.value = 'text';
        passwordFieldIcon.value = 'fas fa-eye-slash';
      } else {
        passwordFieldType.value = 'password';
        passwordFieldIcon.value = 'fas fa-eye';
      }
    };

    const showForgotPasswordModal = () => {
      showPasswordRecovery.value = true;
    };

    const toggleLoginLogComplainModal = () => {
      showLoginLogComplainModal.value = !showLoginLogComplainModal.value;
    };

    return {
      username,
      password,
      passwordFieldType,
      passwordFieldIcon,
      onSubmit,
      togglePasswordVisibility,
      isInvalidLogin,
      isLoading,
      showPasswordRecovery,
      showForgotPasswordModal,
      showLoginLogComplainModal,
      toggleLoginLogComplainModal,
    };
  },
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.loginbody {
  background: linear-gradient(45deg, #202329, #4e545b);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.columns-container {
  display: flex;
  width: 70%;
  height: 80vh;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  overflow: hidden;
  border: solid 5px #0c1118;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  background-color: #1e2127;
}

.left-column h1 {
  color: #ed6834;
  font-size: 50px;
  font-weight: bolder;
  text-align: center;
  width: 100%;
  line-height: 0.9;
}

.left-column p {
  margin-top: 30px;
  padding-left: 50px;
  padding-right: 50px;
  font-size: 14px;
  text-align: center;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.image-container .signin-image {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
}

.right-column {
  background-color: #2b3138;
  display: flex;
  justify-content: center;
  align-items: center;
}


.login-container {
  height: 80%;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: none;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.login-container h1 {
  font-size: 24px;
  color: #cebfad;
  margin-top: 60px;
  margin-bottom: 20px;
  font-weight: bold;
}

.login-container .btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  color: white;
}

.btn-login {
  background-color: #fd662f;
}

.btn-invalid {
  background-color: red;
}

.form-group {
  margin-bottom: 10px;
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 10px;
  font-size: 12px;
  border: none;
  border-radius: 50px;
  box-sizing: border-box;
  background-color: #2b3138;
  color: #d7c9b7;
}



.password-group i {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #ee4429;
}

a {
  color: #ed6834;
  text-decoration: none;
}

.links-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.forgot-password {
  color: #ed6834;
  cursor: pointer;
  text-align: left;
}

.forgot-password:hover {
  text-decoration: underline;
}

.help-text {
  color: #ed6834;
  cursor: pointer;
  text-align: right;
}

.help-text:hover {
  text-decoration: underline;
}

p {
  margin-top: 10px;
  color: #d7c9b7;
}

.input-bar{
  background-color: red;
}

@media (max-width: 430px) {
  .columns-container {
    flex-direction: column;
    width: 90%;
    height: 100vh;
    margin-top: 10px;
    margin-bottom: 10px;
    align-self: center;
  }

  .left-column h1 {
    color: #ed6834;
    font-size: 25px;
    font-weight: bolder;
    text-align: center;
    width: 100%;
  }

  .login-container {
    margin: 20px;
    max-width: 100%;
  }

  .loginbody {
    background: linear-gradient(45deg, #202329, #4e545b);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .left-column p {
    margin-top: 10px;
    margin-bottom: 20px;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 12px;
    justify-content: center;
  }

  .login-container {
    height: 100%;
    width: 100%;
    max-width: 500px;
    padding: 20px;
    background-color: none;
    border-radius: 10px;
    text-align: center;
    box-shadow: none;
  }

  .login-container h1 {
    font-size: 24px;
    color: #cebfad;
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .right-column {
    background-color: #2b3138;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 200px;
  }

  p {
    margin-top: 50px;
    color: #d7c9b7;
  }
}
</style>
