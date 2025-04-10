<template>
  <div>
    <!-- 提示消息 -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <span class="message">{{ notification.message }}</span>
    </div>

    <div class="card">
      <h2>配置参数</h2>
      <form v-on:submit.prevent="handleSubmit">
        <div class="form-group" v-for="item in configs">
          <label :for="item.key">{{ item.label }}</label>
          <input v-model="item.value" :id="item.key" :type="item.type" :min="item.min" :max="item.max" required>
        </div>

        <button type="submit">保存配置</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadAllConfig, saveAllConfig } from '../services/kernelsu';

// 提示消息状态
const notification = ref({
  show: false,
  message: '',
  type: 'success', // 'success' 或 'error'
  timer: null
});

// 显示提示消息
function showNotification(message, type = 'success') {
  // 清除之前的定时器
  if (notification.value.timer) {
    clearTimeout(notification.value.timer);
  }

  // 设置新的提示消息
  notification.value = {
    show: true,
    message,
    type,
    timer: type == 'success' ? 
      setTimeout(() => { notification.value.show = false; }, 5000)
      : null // 5秒后自动消失
  };
}

const configs = ref([
  {
    key: "Check_Mode",
    label: "检查模式 (1=仅温度, 2=仅CPU, 3=两者)",
    value: 3,
    type: "number",
    min: 1,
    max: 3
  },
  {
    key: "Check_Corn",
    label: "检查计划 (Cron表达式)",
    value: "0 */2 0-5 * * *",
    type: "text"
  },
  {
    key: "Temperature_Threshold",
    label: "温度阈值 (°C)",
    value: 45,
    type: "number",
    min: 0,
    max: 120
  },
  {
    key: "Cpu_Usage_Threshold",
    label: "CPU使用率阈值 (%)",
    value: 60,
    type: "number",
    min: 0,
    max: 100
  },
  {
    key: "Overload_Duration",
    label: "高负载持续时间 (秒)",
    value: 240,
    type: "number",
    min: 60,
    max: null
  },
  {
    key: "Max_Reboot_Times",
    label: "最大重启次数",
    value: 2,
    type: "number",
    min: 1,
    max: 99
  }
]);

// 加载配置
async function loadConfig() {
  try {
    const config = await loadAllConfig();

    // 更新表单值
    for (const item of configs.value) {
      if (config[item.key] !== undefined) {
        item.value = config[item.key];
      }
    }

    showNotification('配置加载成功', 'success');
  } catch (error) {
    console.error('加载配置失败:', error);
    showNotification('加载配置失败: ' + error.message, 'error');
  }
}

// 保存配置
async function handleSubmit() {
  try {
    // 将表单数据转换为配置对象
    const config = {};
    for (const item of configs.value) {
      config[item.key] = item.value;
    }

    // 保存配置
    await saveAllConfig(config);
    showNotification('配置保存成功', 'success');
  } catch (error) {
    console.error('保存配置失败:', error);
    showNotification('保存配置失败: ' + error.message, 'error');
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.notification {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: var(--border-radius-m);
  animation: fadeIn 0.3s ease-in-out;
}

.notification.success {
  background-color: rgba(40, 167, 69, 0.2);
  border: 1px solid rgba(40, 167, 69, 0.4);
  color: #28a745;
}

.notification.error {
  background-color: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.4);
  color: #dc3545;
}

.notification .icon {
  margin-right: 10px;
  font-weight: bold;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  /* background: white; */
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius-m);
}

button {
  background-color: #0d6efd;
  color: white;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--border-radius-m);
  cursor: pointer;
}

button:hover {
  background-color: #0b5ed7;
}
</style>