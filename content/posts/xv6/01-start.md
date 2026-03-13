+++
title = "xv6 01 | 开始之前"
date = "2026-03-13T00:00:00+08:00"
draft = false
author = ""
weight = 1
tags = ["xv6", "os"]
categories = ["操作系统"]
series = ["xv6"]
keywords = ["xv6", "risc-v", "os"]
description = "xv6 系列第一篇：说明。"
showFullContent = false
readingTime = false
hideComments = false
+++

这一篇作为 `xv6` 系列的开篇。
由于我是做到一半才开始补文档，所以这一篇主要用于交代目前已经完成了什么，以及后续文章会从什么基础继续展开。

## AI 使用情况

到了 2026 年，这个问题没必要回避。

目前这套代码里，AI 主要参与了下面几类工作：

- 编译脚本的修改，基本由 AI 生成。
- 一些脚手架性质的任务由 AI 生成，例如 `kalloc` 需要提供哪些接口。
- `spinlock` 的原型由我实现，再由 AI 做进一步优化。优化点主要包括：TTAS、使用 `compare_exchange_weak` 替代 `compare_exchange`，以及引入 `name: &'static str` 以便调试，同时兼容 C 接口。
- 一部分常量迁移也借助了 AI 完成。

## 当前进度

首先，lab 部分已经完成了 COW Lab。

在用户态，我引入了 `user/rust`，并修改编译脚本以支持用户态 Rust。这里主要完成了基础 binding，并封装了 `args`、`println!`、`panic`、`global_alloc` 等能力，同时提供了更符合 Rust 风格的 syscall 封装。

在内核态，我引入了 `kernel/rust`，主要做了下面几件事：

1. 为 C 侧生成 binding，使用 `bindgen`。
2. 重写 `kalloc` 和 `vm` 模块，对应的 `.c` 文件不再参与链接。
3. 封装 `pagetable` 和 `proctable` 结构体，提供 `Iterator` 等更高层的抽象，并在部分实验中用它们简化实现。
4. 实现 `spinlock` crate，并接入 Rust 内核态和 C 内核态，C 侧的 `spinlock.c` 也不再参与链接。
