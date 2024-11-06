<script setup>
import {onMounted, ref} from 'vue';
import {useCredit} from "@/store";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";

const creditStore = useCredit();
let amount = ref(null);
let description = ref(null);
const dateFrom = ref(null);
const dateTo = ref(null);
const display = ref(false);

const dropdownValuesDialog = ref([
  { name: 'Credit', code: 'Credit' },
  { name: 'Debit', code: 'Debit' }
]);
const dropdownValues = ref([
  { name: 'All', code: 'All' },
  { name: 'Credit', code: 'Credit' },
  { name: 'Debit', code: 'Debit' }
]);
const selectedValue = ref(null);
const transactionType = ref(null);
const dropdownValue = ref(null);

const amountValid = ref(false);
const descriptionValid = ref(false);
const transactionTypeValid = ref(false);

const confirmPopup = useConfirm();
const toast = useToast();

const searchQuery = ref('');

let updateDropdownValue = (value) => {
  selectedValue.value = value;
  transactionType.value = value ? value.name : null;
}

const open = () => {
  display.value = true;
};

const close = () => {
  display.value = false;
  amount.value = null;
  description.value = null;
  selectedValue.value = null;
  amountValid.value = false;
  descriptionValid.value = false;
  transactionTypeValid.value = false;
};

const confirm = (event) => {
  confirmPopup.require({
    target: event.target,
    message: 'Are you sure you want to proceed?',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      amountValid.value = !amount.value;
      descriptionValid.value = !description.value;
      transactionTypeValid.value = !transactionType.value;

      if (!amountValid.value && !descriptionValid.value && !transactionTypeValid.value) {
        await creditStore.addBalance(amount.value, transactionType.value, description.value)
            .then(response => {
              toast.add({ severity: 'success', summary: 'Confirmed', detail: 'Balance updated successfully', life: 3000 });
            })
            .catch(error => {
              console.error('Failed to update balance:', error);
              toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            });
        await creditStore.getTransactionHistory();
        close();
      }
    },
    reject: () => {
    }
  });
};

const filterTransactions = () => {
  return creditStore.transactionHistory.filter((transaction) => {
    const matchesType = !dropdownValue.value || dropdownValue.value.name === 'All' || transaction.transactionType === dropdownValue.value.name;

    const transactionDate = new Date(transaction.date);
    transactionDate.setHours(0, 0, 0, 0);
    const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    const toDate = dateTo.value ? new Date(dateTo.value) : null;
    if (toDate) toDate.setHours(23, 59, 59, 999);

    const matchesDate = (!fromDate || transactionDate >= fromDate) &&
        (!toDate || transactionDate <= toDate);

    const matchesSearch = !searchQuery.value ||
        transaction.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        transaction.transactionType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        transaction.amount.toString().toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesType && matchesDate && matchesSearch;
  });
};


const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

onMounted(async () => {
  await creditStore.getBalance();
  await creditStore.getTransactionHistory();
})

</script>

<template>
  <section>
      <div class="card">
        <h5>Your Account</h5>
        <div class="header-table">
          <div><p>Balance: <span>{{creditStore.balanceAmount}}€</span></p></div>
          <Dialog header="Add Transaction" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" :modal="true">
            <div class="input-group">
                <div class="input-field">
                  <label for="Amount">Amount</label>
                  <label class="validation-label" v-if="amountValid">This field is required</label>
                  <InputNumber v-model="amount" class="input" :invalid="amountValid" inputId="Amount" mode="currency" currency="EUR" locale="en-US" variant="filled"/>
                </div>
              <div class="input-field">
                  <label for="description">Description</label>
                  <label class="validation-label" v-if="descriptionValid">This field is required</label>
                  <InputText v-model="description" class="input" :invalid="descriptionValid" inputId="description" variant="filled"/>
                </div>
              <div class="input-field">
                <label class="validation-label" v-if="transactionTypeValid">This field is required</label>
                <Dropdown
                    v-model="selectedValue"
                    @update:model-value="updateDropdownValue"
                    class="input"
                    :options="dropdownValuesDialog"
                    :invalid="transactionTypeValid"
                    optionLabel="name"
                    placeholder="Transaction type"
                />
                </div>
            </div>
            <template #footer>
              <Button label="Cancel" @click="close" class="p-button-outlined" />
              <ConfirmPopup></ConfirmPopup>
              <Button ref="popup" @click="confirm($event)" icon="pi pi-plus" label="Add" class="mr-2"></Button>
            </template>
          </Dialog>
          <Button label="Add Transaction" icon="pi pi-plus" style="width: auto" @click="open" />
        </div>
        <DataTable
            :value="filterTransactions()"
            :paginator="true"
            :rows="10"
            dataKey="id"
            :rowHover="true"
            showGridlines
        >
          <template #header>
            <div class="table-header">
              <div>
                <Calendar :showIcon="true" :showButtonBar="true" v-model="dateFrom" class="calendar-from" placeholder="Filter From" dateFormat="dd/mm/yy"></Calendar>
                <Calendar :showIcon="true" :showButtonBar="true" v-model="dateTo" class="calendar-to" placeholder="Filter To" dateFormat="dd/mm/yy"></Calendar>
                <Dropdown v-model="dropdownValue" :options="dropdownValues" optionLabel="name" placeholder="Filter By Transaction Type" class="dropdown" />
              </div>
              <IconField iconPosition="left">
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="Keyword Search" style="width: 100%" />
              </IconField>
            </div>
          </template>
          <template #empty> No transaction history found. </template>
          <template #loading> Loading transaction history. Please wait. </template>
          <Column field="amount" header="Amount" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.amount }} €
            </template>
          </Column>
          <Column field="date" header="Date" dataType="date" style="min-width: 12rem">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>
          <Column field="description" header="Description" style="min-width: 14rem"></Column>
          <Column field="transactionType" header="Transaction Type" filterField="date" dataType="date" style="min-width: 10rem"></Column>
        </DataTable>
      </div>
  </section>
</template>

<style lang="scss" scoped>
  .header-table {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    width: 100%;
    height: 50px;
    border: 1px solid #e2e8f0;
    border-bottom: none;

    p {
      font-size: 19px;
      span {
        font-weight: bold;
      }
    }
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dropdown {
    width: 235px;
    margin-left: 1rem;
  }

  .calendar-to {
    margin-left: 1rem;
  }

  .input-group {
    display: flex;
    width: 222px;
    margin-bottom: 1rem;
    flex-wrap: wrap;

    .input-field {
      display: flex;
      flex-direction: column;
      margin: 1rem 0;
      width: 100%;

      .input {
        margin-top: 4px;
      }

      .validation-label {
        color: red;
      }
    }
  }
</style>
