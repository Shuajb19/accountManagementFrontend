// src/stores/authStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import apiClient from "@/axios";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        message: null,
        flag: null,
        flagRegister: null,
        token: localStorage.getItem('token') || null
    }),
    actions: {
        async login(credentials) {
            try {
                const response = await apiClient.post('/User/login', credentials)
                this.token = response.data.token
                this.message = response.data.message
                this.flag = response.data.flag
                // Store the token in localStorage for persistence
                localStorage.setItem('token', this.token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            } catch (error) {
                console.error('Login failed:', error)
                throw error
            }
        },
        logout() {
            this.token = null
            this.message = null
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
        },
        async register(credentials) {
            try {
                const response = await apiClient.post('/User/register', credentials)
                this.token = response.data.token
                this.message = response.data.message
                this.flagRegister = response.data.flag
                // Store the token in localStorage for persistence
                localStorage.setItem('token', this.token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            } catch (error) {
                console.error('Registration failed:', error)
                throw error
            }
        },
        loadToken() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            }
        },
    }
})

export const useCredit = defineStore('credit', {
    state: () => ({
        balanceAmount: 0,
        transactionType: null,
        transactionHistory: []
    }),
    actions: {
        async addBalance(amount, transactionType, description) {
            const param = {
                amount: amount,
                accountId: 0,
                transactionDate: new Date(),
                transactionType: transactionType,
                description: description,
            }
            try {
                const response = await apiClient.post('/Account/credit', param)
                this.balanceAmount = this.balanceAmount + Number(amount)
            } catch (error) {
                console.error('Add credit amount failed:', error)
                throw error
            }
        },

        async getBalance() {
            try {
                const response = await apiClient.get('/Account/balance')
                this.balanceAmount = response.data.balance;
            } catch (error) {
                console.error('Add credit amount failed:', error)
                throw error
            }
        },

        async getTransactionHistory() {
            try {
                const response = await apiClient.get('/Account/transactions')
                this.transactionHistory = response.data
            } catch (error) {
                console.error('Get transaction history failed:', error)
                throw error
            }
        }
    }
})
