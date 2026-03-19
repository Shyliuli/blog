+++
title = '03 Threads'
date = '2026-03-18T15:44:08+08:00'
draft = false
author = ""
weight = 3
tags = ["xv6", "os"]
categories = ["操作系统"]
series = ["xv6"]
keywords = ["xv6", "risc-v", "os"]
description = "xv6 系列第3篇：Threads Lab"
showFullContent = false
readingTime = false
hideComments = false
+++

# Threads Lab

这一章我们将实现Threads Lab, 并且有可能的话在下一章使用rust重写proc模块(如果下一章不是的话，说明困难比想象的多)
出于学术诚信问题，这一章的代码不会写的"那么清晰"

## 迁移

懒得手动git了，不仅是一些文件，还有一些编译脚本之类的，交给codex了。prompt:

```
我需要迁移到thread分支，请你帮我迁移，保证用户态和内核态的自定义修改（主要是rust）也被正确迁移。
```

## Lab1 Uthread

这个Lab我需要实现一个用户态的线程，xv6提供了一些功能，我要做的基本是补全代码。

先看汇编....直接把内核的 `swtch.S`抄过来。我们只需要保证我们的context结构和内核一致就能直接用:

```asm
	.text

	/*
         * save the old thread's registers,
         * restore the new thread's registers.
         */

	.globl thread_switch
thread_switch:
        sd ra, 0(a0)
        sd sp, 8(a0)
        sd s0, 16(a0)
        sd s1, 24(a0)
        sd s2, 32(a0)
        sd s3, 40(a0)
        sd s4, 48(a0)
        sd s5, 56(a0)
        sd s6, 64(a0)
        sd s7, 72(a0)
        sd s8, 80(a0)
        sd s9, 88(a0)
        sd s10, 96(a0)
        sd s11, 104(a0)

        ld ra, 0(a1)
        ld sp, 8(a1)
        ld s0, 16(a1)
        ld s1, 24(a1)
        ld s2, 32(a1)
        ld s3, 40(a1)
        ld s4, 48(a1)
        ld s5, 56(a1)
        ld s6, 64(a1)
        ld s7, 72(a1)
        ld s8, 80(a1)
        ld s9, 88(a1)
        ld s10, 96(a1)
        ld s11, 104(a1)

        ret
```

然后我们建立一样的Context结构:

```c
struct Context {
  uint64 ra;
  uint64 sp;
  uint64 s0;
  uint64 s1;
  uint64 s2;
  uint64 s3;
  uint64 s4;
  uint64 s5;
  uint64 s6;
  uint64 s7;
  uint64 s8;
  uint64 s9;
  uint64 s10;
  uint64 s11;
};
```

并且在thread里加上它:

```c
  struct Context context;       /* saved registers */
```

最后，我们只需要补全线程切换和初始化.线程切换直接传Context结构体指针即可，初始化则需要考虑将切换的”返回函数“设置为ra，并正确设置栈指针。

## Lab2 ph

很简单，读的时候加锁即可。

## Lab3 barrier

我们增加了一个count全局变量

只要count达到nthread，则清零并增加round，进行广播

否则等待。
