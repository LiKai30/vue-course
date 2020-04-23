<!-- 模板 -->
<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>

      <!-- 登陆表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名和密码 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password" />
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<!-- 行为 -->
<script>
export default {
  // 当前组件的数据
  data() {
    return {
      // 这是登陆表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456"
      },

      // 这是表单的验证规则，不同规则以{}区分
      loginFormRules: {
        username: [
          { requird: true, message: "请输入用户名！", trigger: "blur" },
          { min: 3, max: 10, message: "长度需为3到5个字符！", trigger: "blur" }
        ],
        password: [
          { requird: true, message: "请输入密码！", trigger: "blur" },
          { min: 6, max: 15, message: "长度需为6到15个字符！", trigger: "blur" }
        ]
      }
    }
  },
  // 设置充值按钮，重置表单
  methods: {
    resetLoginForm() {
      // this就是这个表单对象
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 表单的预验证
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        // 根据验证的结果，阻止登陆（原理是onsubmit），通过则发起请求
        // 由于get函数返回一个promise对象，为了简化promise操作，使用async和await优化
        // {date： res}解构赋值，重命名为res  可以查看meta中的状态码，200则登陆成功
        const { data: res } = await this.$http.post("login", this.loginForm)
        if (res.meta.status !== 200) return this.$message.error("登陆失败！")
        this.$message.success("登陆成功！")
        /* 将登陆后的token保存在客户端的sessionstorage中:
					1、项目中除了登陆之外的api接口，必须通过登陆之后才可以访问
					2、token只应在当前网页打开期间有效，所以保存到会话存储的seesionstorage

				*/
        // 保存token
        // console.log(res)
        window.sessionStorage.setItem("token", res.data.token)
        // 跳转到后台主页，/home
        this.$router.push("/home")
      })
    }
  }
}
</script>

<!-- scoped设置单个组件样式 -->
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  transform: translate(-50%, -50%);

  //语法嵌套，less预处理器
  .avatar_box {
    position: absolute;
    left: 50%;
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    background-color: #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      background-color: #eee;
      border-radius: 50%;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0px;
  padding: 0 30px;
  width: 100%;
  // ie盒模型
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
