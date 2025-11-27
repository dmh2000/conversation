# mcp
      "mcpServers": {
        "code_execution": {
          "type": "stdio",
          "command": "claude",
          "args": ["mcp","server", "--enable=code_execution"],
          "env": {}
        }
      },


    lsof -ti:3001,3002 | xargs kill -9 2>/dev/null;