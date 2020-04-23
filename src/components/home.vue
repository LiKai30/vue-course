<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <!-- 三元运算符的使用 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744 "
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menulist" :key="item.id" :index="item.id+''">
            <!-- 一级菜单的模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]" />
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="'/'+subItem.path"
              @click="saveNavState('/'+subItem.path)"
            >
              <!-- 二级菜单的模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu" />
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconObj: {
        125: "el-icon-user-solid",
        103: "el-icon-s-management",
        101: "el-icon-s-goods",
        102: "el-icon-s-order",
        145: "el-icon-s-data"
      },
      // 侧边边栏的折叠
      isCollapse: false,
      // 默认是一个空地址
      activePath: ""
    }
  },
  // 页面创建，刷新就会重新创建。
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem("activePath")
  },
  methods: {
    //获取所有菜单数据
    async getMenuList() {
      // 因为get函数返回值是一个promise，所以通过async和await来简化promise
      const { data: res } = await this.$http.get("menus")
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // 为了能够在页面中渲染出来，我们应该把获取到的菜单数据挂载到自己的data中
    },
    logout() {
      window.sessionStorage.clear()
      this.$router.push("/login")
    },
    toggleCollapse() {
      // 实现不断切换
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath)
      // 被激活的链接地址
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex; //弹性布局
  //左右贴边
  justify-content: space-between;
  padding-left: 0;
  //使包含的元素垂直居中
  align-items: center;
  color: #fff;
  font-size: 20px;
  //子元素选择器
  > div {
    display: flex;
    //垂直居中
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
//类名选择器的使用
.el-aside {
  background-color: #333744;
  //实现平滑过渡
  transition:all 0.5s;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.el-icon {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
