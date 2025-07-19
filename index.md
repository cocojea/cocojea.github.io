# GitHub Pages个人博客模板

> 本模板包含Jekyll博客所需的核心文件，上传至`用户名.github.io`仓库后自动生效。  
> 修改说明见各代码块注释，替换`你的GitHub用户名`等占位符即可使用。

---

### 1. 配置文件 `_config.yml`
```yaml
# _config.yml
title: "我的技术博客"          # 博客标题
description: "分享开发笔记"     # 博客描述
baseurl: ""
url: "https://你的GitHub用户名.github.io"  # 替换为你的地址

# Jekyll设置
theme: minima                 # 默认主题（可更换）
plugins: [jekyll-feed]        # 支持RSS订阅

# 作者信息
author:
  name: "你的名字"
  github: "你的GitHub用户名"
avatar: "/assets/images/avatar.jpg"  # 头像路径（需替换图片）

# 社交账号（按需启用）[2,7](@ref)
social:
  github: 你的GitHub用户名
  weibo: 微博ID
  zhihu: 知乎用户名
