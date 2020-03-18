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
      <el-button type="primary">添加角色</el-button>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开权限列表 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 二级权限和三级权限 -->
              <el-col :span="19">
                <!-- 二级权限列表渲染 -->
                <el-row
                  :class="[i2 === 0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  closable
                  @close="removeRightById(scope.row, item2.id)"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="[i3 === 0 ? '':'bdtop']"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件-->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      //控制分配权限的对话框
      setRightDialogVisible: false,
      rightList: [],
      //树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      //默认选中的权限id
      defKeys: [],
      //当前即将分配权限的角色id
      roleId: ""
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles")

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！")
      }
      this.rolesList = res.data
    },
    async removeRightById(role, rightId) {
      const comfirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err)

      if (comfirmResult !== "confirm") {
        return this.$message.info("已取消删除！")
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！")
      }
      // this.getRolesList() 这样会重新渲染角色页面
      //由于服务器api中规定删除后会返回最新data，我们只需要给角色重新赋值即可
      role.children = res.data
    },

    //弹出分配权限的对话框，并获取权限数据
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get("rights/tree")

      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！")
      }

      this.rightList = res.data
      //递归获取三级权限
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式获取角色下的所有三级权限id，并保存在defKeys中，
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    //分配权限的操作
    async allotRights() {
      //...将一个数组转换成逗号分隔的参数序列
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(",")
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！")
      }
      this.$message.success("分配权限成功！")
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  align-items: center;
  display: flex;
}
</style>