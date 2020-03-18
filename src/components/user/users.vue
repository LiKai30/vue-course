<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加 gutter表示沟的意思，用来设置列与列之间的间隙-->
      <el-row :gutter="20">
        <!-- 列,span表示设置输入框的宽度，至少设置两个 -->
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入用户名称" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList" />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表区域 -->
    <el-table :data="userList" border stripe>
      <!-- 添加索引列 -->
      <el-table-column type="index" />
      <el-table-column label="姓名" prop="username" />
      <el-table-column label="邮箱" prop="email" />
      <el-table-column label="电话" prop="mobile" />
      <el-table-column label="角色" prop="role_name" />
      <el-table-column label="状态" prop="mg_state">
        <template slot-scope="scope">
          <!-- 获取对应行的数据scope.row -->
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.id)"
          />
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeUserById(scope.row.id)"
          />
          <!-- 分配角色按钮,tooltip是鼠标悬浮会提示 -->
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="ShowSetRoleDialog(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <!-- layout展示的功能组件 -->
    <el-pagination
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 5, 10, 20]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <!-- 对话框的底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog 
    title="分配角色" 
    :visible.sync="setRoleDialogVisible" 
    width="50%"
    @close="setRoleDialogClosed"
    >
      <p>当前的用户：{{ userInfo.username }}</p>
      <p>当前的角色：{{ userInfo.role_name }}</p>
      <p>
        分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>

      <!-- 对话框的底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //   验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-aA-Z0-9 -])+@([a-zA-Z0-9 -])+(\.[a-zA-Z0-9 -])+/
      if (regEmail.test(value)) {
        //合法邮箱
        return cb()
      }
      cb(new Error("请输入正确的邮箱！"))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error("请输入正确的手机号码！"))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前显示的多少条数据
        pagesize: 1
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加用户的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名!", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码!", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "密码的长度在3~10之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱!", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码!", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //控制修改用户的对话框的显示与否
      editDialogVisible: false,
      // 修改用户信息的表单数据
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱!", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码!", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //控制分配角色的对话框的显示与否
      setRoleDialogVisible: false,

      //获取要分配权限 的角色信息
      userInfo: {},

      // 所有的角色数据
      roleList: [],

      //下拉列表选中的角色id
      selectedRoleId: ''
    }
  },
  // 生命周期函数
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败!")
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize的变化
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 重新获取用户数据
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听开关状态的改变
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error("更新用户状态失败！")
      }
      this.$message.success("更新用户状态成功！")
    },

    //监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    //添加用户检验
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm)
        //请求失败
        if (res.meta.status !== 201)
          return this.$message.error("添加用户失败！")
        this.$message.success("添加用户成功！")
        //关闭对话框
        this.addDialogVisible = false
        //刷新用户列表
        this.getUserList()
      })
    },

    //显示修改用户信息的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户信息失败！")
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //监听修改用户对话框的关闭事件，这个有必要嘛?
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //提交用户修改并刷新
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发起修改用户信息的请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！")
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success("修改用户信息成功！")
      })
    },
    //删除操作
    async removeUserById(id) {
      const comfirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err)
      // console.log(comfirmResult)
      // 点击确认返回confirm
      // 取消则返回cancel
      if (comfirmResult !== "confirm") {
        return this.$message.info("已取消删除！")
      }
      const { data: res } = await this.$http.delete("users/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败！")
      }
      this.$message.success("已成功删除！")
      this.getUserList()
    },

    //显示分配角色的对话框
    async ShowSetRoleDialog(userInfo) {
      //显示要分配角色的用户信息
      this.userInfo = userInfo
      //在弹出对话框之前获取角色数据
      const { data: res } = await this.$http.get("roles")
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色数据失败！")
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },

    //保存分配的角色信息
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择一个角色！")
      }

      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error("分配角色失败！")
      }
      this.$message.success("分配角色成功！")
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //监听分配角色的对话框的关闭事件s
    setRoleDialogClosed(){
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>
