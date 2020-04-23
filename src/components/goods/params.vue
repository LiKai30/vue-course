<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-alert show-icon title="注意：只允许为第三级相关参数设置分类！" type="warning" :closable="false"></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>请选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            clearable
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //级联选择框的配置对象
      cateProps: {
          expandTrigger:'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //级联选择器双向绑定到的数组
      selectedCateKeys:[]
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories")
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败！")
      }

      this.cateList = res.data
      console.log(this.cateList)
    }
  },
  //级联选择器中的选项变化，触发该函数
  handleChange(){
      // console.log(this.selectedCateKeys)
      //证明选中的不是三级分类
      if(this.selectedCateKeys.length !== 3){
        this.selectedCateKeys = []
        return
      }
      console.log("选中")
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
</style>