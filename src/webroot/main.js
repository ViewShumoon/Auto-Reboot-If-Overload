
import { toast } from 'kernelsu';

// 初始加载
loadConfig();

toast('Hello, world!');

// 保存配置
document.getElementById('configForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = {
      tempThreshold: document.getElementById('tempThreshold').value,
      cpuThreshold: document.getElementById('cpuThreshold').value,
      overloadTime: document.getElementById('overloadTime').value
  };

  try {
      const configContent = `TEMP_THRESHOLD=${formData.tempThreshold}
CPU_THRESHOLD=${formData.cpuThreshold}
OVERLOAD_TIME=${formData.overloadTime}`;
      
      await ksu.execCommand(`echo '${configContent}' > $MODPATH/config.conf`);
      alert('配置已保存');
  } catch (error) {
      alert('保存失败: ' + error);
  }
});


// 加载配置
async function loadConfig() {
  try {
      const result = await ksu.execCommand('cat $MODPATH/config.conf');
      const config = {};
      result.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
              config[key] = parseInt(value);
          }
      });
      
      document.getElementById('tempThreshold').value = config.TEMP_THRESHOLD || 80;
      document.getElementById('cpuThreshold').value = config.CPU_THRESHOLD || 90;
      document.getElementById('overloadTime').value = config.OVERLOAD_TIME || 300;
  } catch (error) {
      console.error('加载配置失败:', error);
  }
}
