<script setup>
import { ref } from 'vue'
import {useAuthStore} from "@/store";
import { useRouter } from 'vue-router'
import Message from 'primevue/message';

const authStore = useAuthStore()
const router = useRouter()
const email = ref('shuajb@gmail.com')
const password = ref('Shuajb123!')
let flag = ref(null)
let loginResponse = ref(null)

const login = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value })
    await router.push('/');
    flag.value = authStore.flag;
    if (flag.value === false) {
      loginResponse.value = authStore.message
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<template>
  <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
    <div class="flex flex-column align-items-center justify-content-center">
      <!--            <img :src="" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />-->
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
          <div class="text-center mb-5">
            <!--                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />-->
            <div class="text-900 text-3xl font-medium mb-3">Welcome</div>
            <span class="text-600 font-medium">Sign in to continue</span>
            <Message severity="error" :closable="false" v-if="flag === false">{{loginResponse}}</Message>
          </div>

          <form @submit.prevent="login()">
            <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
            <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" required />

            <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
            <Password type="password" id="password1" v-model="password" placeholder="Password"
                      :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" @input="flag = null" required></Password>

            <div class="flex align-items-center justify-content-between mb-5 gap-5">
              <div class="flex align-items-center">
                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                <label for="rememberme1">Remember me</label>
              </div>
              <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Forgot password?</a>
            </div>
            <Button type="submit" label="Sign In" class="w-full p-3 text-xl"></Button>
            <div class="flex justify-content-center mt-2">
              <hr class="w-full"><p class="pl-2 pr-2">or</p><hr class="w-full">
            </div>
            <RouterLink to="register">
              <Button label="Sign Up" class="w-full p-3 text-xl" severity="secondary"></Button>
            </RouterLink>
          </form>
        </div>
      </div>
    </div>
  </div>
  <AppConfig simple />
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>
