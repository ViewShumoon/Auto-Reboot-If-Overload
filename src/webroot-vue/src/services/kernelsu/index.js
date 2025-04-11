import { exec, toast } from 'kernelsu';

// Path
const modulePath="/data/adb/modules/ka"
const configPath=`${modulePath}/config.conf`


async function executeCommand(cmd) {
	const { errno, stdout, stderr } = await exec(cmd);
	if (errno != 0) {
		return undefined;
	} else {
		return stdout;
	}
}

/**
 * 读取 $MODDIR/config.conf 配置文件
 * @returns {Promise<Object>} 配置对象
 */
export async function loadAllConfig() {
  try {
    // 使用 cat 命令读取配置文件
    const allLines = await executeCommand(`cat ${config}/config.conf`);
    
    if (allLines == undefined) {
      console.error('读取配置文件失败:', stderr);
      throw new Error(`读取配置文件失败: ${stderr}`);
    }
    
    // 解析配置文件内容
    const configLines = stdout.split('\n').filter(line => line.includes('='));

    // const mockData = "Check_Mode = 3\nCheck_Task_Corn = \"0 */2 0-5 * * *\"\nTemperature_Threshold = 45\nCpu_Usage_Threshold = 60\nOverload_Duration = 240\nMax_Reboot_Times = 2\n"
    // const configLines = mockData.split('\n');
        
    const config = {};
    
    for (const line of configLines) {
      // 跳过注释和空行
      if (line.trim() === '' || line.trim().startsWith('#')) {
        continue;
      }
      
      // 解析键值对
      const match = line.match(/^\s*([^=]+)\s*=\s*(.+)\s*$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // 处理引号包裹的值
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // 尝试转换为数字
        if (!isNaN(value)) {
          value = Number(value);
        }
        
        config[key] = value;
      }
    }
    
    return config;
    
  } catch (error) {
    console.error('加载配置时出错:', error);
    throw error;
  }
}

/**
 * 保存配置到 $MODDIR/config.conf 文件
 * @param {Object} config 配置对象
 * @returns {Promise<void>}
 */
export async function saveAllConfig(config) {
  try {
    // 将配置对象转换为配置文件格式
    let configContent = '';
    
    for (const [key, value] of Object.entries(config)) {
      // 如果值是字符串且包含空格，则用引号包裹
      const formattedValue = typeof value === 'string' && value.includes(' ') 
        ? `"${value}"` 
        : value;
      
      configContent += `${key} = ${formattedValue}\n`;
    }
    
    // 使用 echo 和重定向将内容写入配置文件
    const allLines = await executeCommand(`echo '${configContent}' > ${configPath}`);
    
    if (allLines == undefined) {
      console.error('保存配置文件失败:', stderr);
      throw new Error(`保存配置文件失败: ${stderr}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('保存配置时出错:', error);
    throw error;
  }
}