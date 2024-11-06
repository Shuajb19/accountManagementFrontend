<script setup>
import {computed, onMounted, ref} from 'vue'
import {useAuthStore} from "@/store";
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast';
import Message from "primevue/message";


const authStore = useAuthStore()
const router = useRouter()
const toast = useToast();
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
let flag = ref(null)
let registerResponse = ref(null)
const lengthValid = ref(null);
const uppercaseValid = ref(null);
const numberValid = ref(null);
const specialValid = ref(null);
const showValidationData = ref(false)

const register = async () => {
  try {
    await authStore.register({ name: name.value, email: email.value, password: password.value, confirmPassword: confirmPassword.value })
        .then((response) => {
          flag.value = authStore.flagRegister;
          if (flag.value === false) {
            registerResponse.value = authStore.message
          }
          toast.add({ severity: 'success', summary: 'Confirmed', detail: 'You have been register successfully' + response.message, life: 3000 });
        }).catch((error) => {
          toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have been rejected', life: 3000 });
        })
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const validatePassword = () => {
  lengthValid.value = password.value.length >= 8;
  uppercaseValid.value = /[A-Z]/.test(password.value);
  numberValid.value = /\d/.test(password.value);
  specialValid.value = /[!@#$%^&*]/.test(password.value);

  return lengthValid.value === true && uppercaseValid.value === true && numberValid.value === true && specialValid.value === true;
};

const warnValidation = () => {
  if (name.value.length !== 0 && email.value.length !== 0) {
    toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'Please check password', life: 3000 });
  }
}

const lengthClass = computed(() => {
  return lengthValid.value ? 'text-green-500' : 'text-red-500';
});

const uppercaseClass = computed(() => {
  return uppercaseValid.value ? 'text-green-500' : 'text-red-500';
});

const numberClass = computed(() => {
  return numberValid.value ? 'text-green-500' : 'text-red-500';
});

const specialClass = computed(() => {
  return specialValid.value ? 'text-green-500' : 'text-red-500';
});

onMounted(() => {
})
</script>

<template>
  <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
    <div class="flex flex-column align-items-center justify-content-center">
      <!--            <img :src="" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />-->
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
          <div class="text-center mb-5">
            <!--                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />-->
            <div class="text-900 text-3xl font-medium mb-3">Sign Up</div>
            <span class="text-600 font-medium">Sign up to continue</span>
            <Message severity="error" :closable="false" v-if="flag === false">{{registerResponse}}</Message>
          </div>

          <form @submit.prevent="register()">
            <label for="name" class="block text-900 text-xl font-medium mb-2">Name</label>
            <InputText id="name" type="text" placeholder="Name" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="name" required />

            <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
            <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" required />

            <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
            <Password type="password" id="password1" v-model="password" placeholder="Password"
                      :toggleMask="true" class="w-full md:w-30rem mb-5" inputClass="w-full" :inputStyle="{ padding: '1rem' }" @input="validatePassword(); showValidationData = true" required></Password>

            <label for="confirmPassword" class="block text-900 font-medium text-xl mb-2">Confirm Password</label>
            <Password type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Confirm Password"
                      :toggleMask="true" class="w-full md:w-30rem mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" required></Password>

            <div class="mb-4" v-if="password">
              <p :class="lengthClass">Password must be at least 8 characters long.</p>
              <p :class="uppercaseClass">Password must contain at least one uppercase letter.</p>
              <p :class="numberClass">Password must contain at least one number.</p>
              <p :class="specialClass">Password must contain at least one special character (!@#$%^&*).</p>
            </div>

            <Toast />
            <div>
              <Button v-if="validatePassword() === false" @click="warnValidation()" label="Sign Up" class="w-full p-3 text-xl"></Button>
              <Button v-if="validatePassword() === true" type="submit" label="Sign Up" class="w-full p-3 text-xl"></Button>
            </div>
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
