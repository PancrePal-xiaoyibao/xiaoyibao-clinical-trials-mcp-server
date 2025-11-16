# Claude Desktop 配置示例

将以下配置添加到你的 Claude Desktop 配置文件中。

## macOS/Linux

配置文件位置：`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "clinical-trials": {
      "command": "node",
      "args": [
        "/Users/qinxiaoqiang/Downloads/clinical_trials_mcp/src/index.js"
      ]
    }
  }
}
```

## Windows

配置文件位置：`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "clinical-trials": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUsername\\Downloads\\clinical_trials_mcp\\src\\index.js"
      ]
    }
  }
}
```

## 验证配置

配置完成后：

1. 重启 Claude Desktop
2. 在对话中输入查询，例如：

```
请帮我查询中国正在招募的 KRAS G12D 胰腺癌临床试验，只要过去3个月的。
```

Claude 应该能够调用 `search_clinical_trials` 工具并返回结果。

## 其他 MCP 客户端

如果你使用其他支持 MCP 的客户端，请参考该客户端的文档配置方法。核心配置信息：

- **Command**: `node`
- **Args**: `["/path/to/clinical_trials_mcp/src/index.js"]`
- **Transport**: stdio

## 故障排除

### 问题：工具未出现在 Claude 中

**解决方法**:
1. 检查配置文件路径是否正确
2. 确保 Node.js 已安装（`node --version`）
3. 确保项目依赖已安装（`npm install`）
4. 检查文件路径是否使用绝对路径
5. 重启 Claude Desktop

### 问题：调用工具时出错

**解决方法**:
1. 检查网络连接（需要访问 clinicaltrials.gov）
2. 查看终端输出的错误信息
3. 确认 API 速率限制未超出（50 请求/分钟）

### 问题：查询结果为空

**解决方法**:
1. 尝试放宽查询条件
2. 使用英文关键词和疾病名称
3. 检查国家和城市名称拼写
4. 移除时间范围限制测试
