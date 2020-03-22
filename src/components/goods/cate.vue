<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域  @click="addDialogVisible = true"-->
    <el-card>
      <el-button type="primary" style="margin-bottom:12px" @click="showAddCateDialog">添加分类</el-button>

      <!-- 树形表格 -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" show-index>
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <!-- layout展示的功能组件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <el-dialog
      title="添加分类"
      :visible.sync="setAddCateDialogVisible"
      width="50%"
      @close="setAddCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>

        <el-form-item label="父级分类:">
          <!-- options用来制定数据源
               props用来指定配置对象
          -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>

      <!-- 对话框的底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setAddCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },

      cateList: [],
      //总数据条数
      total: 0,
      //为tree-table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //表示当前列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          //表示当前列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          //表示当前列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "opt"
        }
      ],

      //控制添加分类的对话框显示与否
      setAddCateDialogVisible: false,

      //添加分类的表单数据
      addCateForm: {
        //需要添加的分类名称
        cat_name: "",
        //父级分类的id
        cat_pid: 0,
        //父类的等级，默认是添加一级
        cat_level: 0
      },

      //添加分类的表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      parentCateList: [],

      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },

      //选中的父级分类id
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败！")
      }
      console.log(res.data)
      this.cateList = res.data.result
      //   console.log(this.queryInfo)
      this.total = res.data.total
    },

    //监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      console.log("shop" + newSize)
      // 重新获取用户数据
      this.getCateList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      console.log(newPage)

      this.getCateList()
    },
    //添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据
      this.getParentCateList()
      //再显示对话框
      this.setAddCateDialogVisible = true
    },

    //获取父级分类的列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！")
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    //选择项变化的时候触发这个函数
    parentCateChanged() {
      //如果selectedKey的length大于0，则选中
      //否则没有
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //保存添加的分类信息
   saveCateInfo() {
      console.log(this.addCateForm)
       this.$refs.addCateFormRef.validate(async valid=>{
          if(!valid) return
          const {data:res} = await this.$http.post('categories',this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error("添加商品分类失败！")
          }
          this.$message.success("添加商品分类成功！")
          this.getCateList()
          this.setAddCateDialogVisible = false
      })
      
    },

    //监听添加分类的对话框的关闭事件
    setAddCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
 