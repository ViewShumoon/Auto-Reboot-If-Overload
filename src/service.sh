#!/system/bin/sh
# Do NOT assume where your module will be located.
# ALWAYS use $MODDIR if you need to know where this script
# and module is placed.
# This will make sure your module will still work
# if Magisk change its mount point in the future
MODDIR=${0%/*}

# This script will be executed in late_start service mode

# 配置参数
CONFIG_FILE="$MODDIR/config.conf"
LOG_FILE="$MODDIR/monitor.log"

CHECK_INTERVAL=60  # 检查间隔（秒）
TEMP_THRESHOLD=80  # 温度阈值（摄氏度）
CPU_THRESHOLD=90   # CPU使用率阈值（百分比）
OVERLOAD_TIME=300  # 高负载持续时间阈值（秒）

# 初始化配置
init_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "TEMP_THRESHOLD=$TEMP_THRESHOLD" > "$CONFIG_FILE"
        echo "CPU_THRESHOLD=$CPU_THRESHOLD" >> "$CONFIG_FILE"
        echo "OVERLOAD_TIME=$OVERLOAD_TIME" >> "$CONFIG_FILE"
    fi
}

# 读取配置
load_config() {
    source "$CONFIG_FILE"
}

# 获取CPU温度
get_cpu_temp() {
    cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{print $1/1000}'
}

# 获取CPU使用率
get_cpu_usage() {
    top -n 1 | grep "CPU:" | awk '{print $2}' | cut -d'%' -f1
}

# 记录日志
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# 主循环
main() {
    init_config
    overload_start_time=0
    is_overload=0

    while true; do
        load_config
        
        temp=$(get_cpu_temp)
        cpu_usage=$(get_cpu_usage)
        
        log_message "Temperature: ${temp}°C, CPU Usage: ${cpu_usage}%"
        
        if [ "$temp" -gt "$TEMP_THRESHOLD" ] || [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
            if [ "$is_overload" -eq 0 ]; then
                overload_start_time=$(date +%s)
                is_overload=1
                log_message "High load detected"
            fi
            
            current_time=$(date +%s)
            overload_duration=$((current_time - overload_start_time))
            
            if [ "$overload_duration" -ge "$OVERLOAD_TIME" ]; then
                log_message "System overload for too long, initiating reboot"
                reboot
            fi
        else
            is_overload=0
        fi
        
        sleep "$CHECK_INTERVAL"
    done
}

# 启动主程序
main

exit 0
