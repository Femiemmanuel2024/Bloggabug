<template>
    <div class="profile-settings">
      <div class="content">
        <!-- Welcome Message -->
        <div class="welcome-message">
          <p>Welcome to Blugbug! Fill up your profile settings to complete your profile and set a secret question to retrieve your password if needed.</p>
          <p>Next, select the categories of blugs you wish to see in your "MyBlug" tab on your homepage. Press "Accept" when you are done.</p>
        </div>
  
        <h1>Profile Settings</h1>
        <table v-if="user">
          <!-- Full Name -->
          <tr>
            <th>Full Name</th>
            <td>
              <input v-if="editing.full_name" v-model="user.full_name" />
              <span v-else>{{ user.full_name }}</span>
            </td>
            <td>
              <button @click="toggleEdit('full_name')">{{ editing.full_name ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
          <!-- Blugger Name -->
          <tr>
            <th>Blugger Name</th>
            <td>
              <input v-if="editing.chatter_name" v-model="user.chatter_name" />
              <span v-else>{{ user.chatter_name }}</span>
            </td>
            <td>
              <button @click="toggleEdit('chatter_name')">{{ editing.chatter_name ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
          <!-- Email -->
          <tr>
            <th>Email</th>
            <td>
              <input v-if="editing.email" v-model="user.email" />
              <span v-else>{{ user.email }}</span>
            </td>
            <td>
              <button @click="toggleEdit('email')">{{ editing.email ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
          <!-- Password -->
          <tr>
            <th>Password</th>
            <td>
              <input v-if="editing.password" type="password" v-model="user.password" />
              <span v-else>********</span>
            </td>
            <td>
              <button @click="toggleEdit('password')">{{ editing.password ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
          <!-- About Me -->
          <tr>
            <th>About Me</th>
            <td>
              <textarea v-if="editing.about_me" v-model="user.about_me"></textarea>
              <span v-else>{{ user.about_me }}</span>
            </td>
            <td>
              <button @click="toggleEdit('about_me')">{{ editing.about_me ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
          <!-- Secret Question -->
          <tr>
            <th>Secret Question</th>
            <td>
              <select v-if="editing.secret_question" v-model="user.secret_question">
                <option disabled value="">Select a Secret Question</option>
                <option v-for="question in secretQuestions" :key="question" :value="question">
                  {{ question }}
                </option>
              </select>
              <span v-else>{{ user.secret_question }}</span>
            </td>
            <td>
              <button @click="toggleEdit('secret_question')">{{ editing.secret_question ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
          <!-- Secret Answer -->
          <tr>
            <th>Secret Answer</th>
            <td>
              <input v-if="editing.secret_answer" v-model="user.secret_answer" />
              <span v-else>{{ user.secret_answer ? '******' : '' }}</span>
            </td>
            <td>
              <button @click="toggleEdit('secret_answer')">{{ editing.secret_answer ? 'Save' : 'Edit' }}</button>
            </td>
          </tr>
        </table>
        <div v-else>
          Loading user data...
        </div>
        <div class="categories">
          <h2>Select Your Interested Categories</h2>
          <div class="selected-categories">
            <input v-for="category in selectedCategories" :key="category" type="text" :value="category" readonly />
          </div>
          <div class="category-buttons">
            <button
              v-for="category in categories"
              :key="category"
              :class="{'selected': selectedCategories.includes(category)}"
              @click="toggleCategorySelection(category)"
              @mouseover="showTooltip($event, category)"
              @mouseout="hideTooltip"
            >
              {{ category }}
              <span class="tooltip">{{ category }}</span>
            </button>
          </div>
          <div v-if="selectedCategories.length >= 5" class="limit-message">
            You can only select up to 5 categories.
          </div>
          <div class="accept-button-container">
            <button @click="saveCategories" class="accept-button">Accept</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { supabase } from '../supabase';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  
  interface User {
    id: string;
    full_name: string;
    chatter_name: string;
    email: string;
    password: string;
    about_me: string;
    interest_id: string;
    secret_question: string;
    secret_answer: string;
  }
  
  export default defineComponent({
    name: 'ProfileSettings',
    components: {
      FontAwesomeIcon
    },
    setup() {
      const router = useRouter();
      const user = ref<User | null>(null);
      const editing = ref<Record<string, boolean>>({
        full_name: false,
        chatter_name: false,
        email: false,
        password: false,
        about_me: false,
        secret_question: false,
        secret_answer: false,
      });
  
      const secretQuestions = [
        'What was the name of your first pet?',
        'What is your mother’s maiden name?',
        'What was the make and model of your first car?',
        'What is the name of your favorite childhood friend?',
        'In what city were you born?',
        'What is your favorite book?'
      ];
  
      const categories = [
        'Health and Wellness', 'Fitness and Exercise', 'Nutrition and Diet', 'Mental Health and Well-being',
        'Yoga and Meditation', 'Beauty and Skincare', 'Fashion and Style', 'Travel and Adventure', 'Solo Travel Tips',
        'Budget Travel', 'Luxury Travel Destinations', 'Digital Nomad Lifestyle', 'Home Decor and Interior Design',
        'DIY Home Projects', 'Gardening and Landscaping', 'Parenting Tips and Advice', 'Pregnancy and Newborn Care',
        'Toddler Activities', 'Education and Learning', 'Homeschooling Tips', 'Student Life and Study Hacks',
        'Career Development', 'Resume Writing Tips', 'Job Interview Preparation', 'Personal Finance', 
        'Investing and Wealth Management', 'Budgeting and Saving Tips', 'Side Hustles and Freelancing',
        'Entrepreneurship and Startups', 'Marketing and Branding Strategies', 'Social Media Tips and Trends',
        'Tech Gadgets and Reviews', 'Software and App Development', 'Coding and Programming', 
        'Web Design and Development', 'Photography Tips and Techniques', 'Art and Creativity', 
        'Music and Concert Reviews', 'Film and TV Show Reviews', 'Book Recommendations and Reviews', 
        'Literary Analysis and Criticism', 'History and Historical Events', 'Philosophy and Ethics', 
        'Religion and Spirituality', 'Cultural Traditions and Festivals', 'Environmental Issues and Conservation', 
        'Climate Change Solutions', 'Wildlife and Nature Conservation', 'Adventure Sports and Extreme Activities', 
        'Sports News and Updates'
      ];
  
      const selectedCategories = ref<string[]>([]);
  
      const fetchUserData = async () => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
          return;
        }
  
        const userId = JSON.parse(currentUser).id;
  
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
  
        if (error) {
          return;
        }
  
        if (data) {
          user.value = data;
          selectedCategories.value = data.interest_id ? data.interest_id.split(',') : [];
        }
      };
  
      const toggleEdit = async (field: keyof User) => {
        if (!user.value) return;
  
        if (editing.value[field]) {
          const { error } = await supabase
            .from('users')
            .update({ [field]: user.value[field] })
            .eq('id', user.value.id);
  
          if (error) {
            return;
          }
        }
  
        editing.value[field] = !editing.value[field];
      };
  
      const toggleCategorySelection = (category: string) => {
        if (selectedCategories.value.includes(category)) {
          selectedCategories.value = selectedCategories.value.filter(item => item !== category);
        } else if (selectedCategories.value.length < 5) {
          selectedCategories.value.push(category);
        }
      };
  
      const saveCategories = async () => {
        if (!user.value) return;
  
        const { error } = await supabase
          .from('users')
          .update({ interest_id: selectedCategories.value.join(',') })
          .eq('id', user.value.id);
  
        if (error) {
          return;
        }
  
        // Route to the homepage after saving categories
        router.push('/home');
      };
  
      const showTooltip = (event: MouseEvent, category: string) => {
        const tooltip = (event.currentTarget as HTMLElement).querySelector('.tooltip') as HTMLElement;
        tooltip.style.visibility = 'visible';
        tooltip.textContent = category;
      };
  
      const hideTooltip = (event: MouseEvent) => {
        const tooltip = (event.currentTarget as HTMLElement).querySelector('.tooltip') as HTMLElement;
        tooltip.style.visibility = 'hidden';
      };
  
      onMounted(() => {
        fetchUserData();
      });
  
      return {
        user,
        editing,
        toggleEdit,
        secretQuestions,
        categories,
        selectedCategories,
        toggleCategorySelection,
        saveCategories,
        showTooltip,
        hideTooltip,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Add your CSS styles here */
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
  
  .profile-settings {
    height: 100vh;
    padding-right: 50px;
    padding-left: 50px;
    padding-top: 63px;
  }
  
  .content {
    background-color: #1e2127;
    padding: 20px 50px 20px 50px;
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
  }
  
  .welcome-message {
    color: #cebfad;
    margin-bottom: 20px;
    text-align: center;
  }
  
  h1 {
    color: #cebfad;
    margin-bottom: 20px;
    text-align: center;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  th, td {
    padding: 10px;
  }
  
  th {
    background-color: #2b3138;
    color: #cebfad;
  }
  
  td input,
  td textarea,
  td select {
    width: 100%;
    padding: 8px;
    background-color: #2b3138;
    color: #cebfad;
    border: none;
    border-radius: 4px;
    resize: none;
    height: 50px;
  }
  
  td {
    color: white;
  }
  
  button {
    padding: 5px 10px;
    background-color: #fd662f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #e04a2e;
  }
  
  .categories {
    margin-top: 20px;
  }
  
  .categories h2 {
    color: #cebfad;
    margin-bottom: 10px;
  }
  
  .selected-categories input {
    background-color: #2b3138;
    color: #cebfad;
    border: none;
    border-radius: 4px;
    padding: 5px;
    margin-right: 5px;
    width: 200px;
    margin-bottom: 10px;
    border-bottom: 1px solid #cebfad;
  }
  
  .category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .category-buttons button {
    background-color: #2b3138;
    color: #cebfad;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
    width: 205px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    position: relative;
  }
  
  .category-buttons button.selected {
    background-color: #fd662f;
    color: white;
  }
  
  .category-buttons button .tooltip {
    visibility: hidden;
    width: auto;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5px;
    white-space: nowrap;
  }
  
  .category-buttons button:hover .tooltip {
    visibility: visible;
  }
  
  .accept-button-container {
    display: flex;
    justify-content: flex-end;
  }
  
  .accept-button {
    margin-top: 10px;
    width: 210px;
    margin-bottom: 10px;
  }
  
  .limit-message {
    color: red;
    margin-top: 10px;
  }
  
  /* CSS for iPad screen size */
  @media screen and (min-width: 768px) and (max-width: 1024px) {
    /* Add styles for iPad screen size here */
  }
  
  /* CSS for phone screen size */
  @media screen and (max-width: 767px) {
    .profile-settings {
      height: 100vh;
      padding-right: 2px;
      padding-left: 2px;
      padding-top: 160px;
    }
  
    .content {
      background-color: #1e2127;
      padding: 20px 0px 20px 0px;
      width: 100%;
      max-width: 100%;
      min-height: 100vh;
    }
  
    .category-buttons button {
      background-color: #2b3138;
      color: #cebfad;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      position: relative;
    }
  
    .accept-button {
      margin-top: 10px;
      width: 100%;
      margin-bottom: 10px;
    }
  
    .selected-categories input {
      background-color: #2b3138;
      color: #cebfad;
      border: none;
      border-radius: 4px;
      padding: 5px;
      margin-right: 5px;
      width: 100%;
      margin-bottom: 10px;
      border-bottom: 1px solid #cebfad;
    }
  }
  </style>
  