<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.appId" :placeholder="$t('app.appId')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" :placeholder="$t('app.status')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in appStatuses" :key="item.value" :label="item.name" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('add') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" :label="$t('id')" type="index" width="50px" />
      <el-table-column :label="$t('app.appId')" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.appId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.appSecurity')" width="250px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.appSecurity | uuidMaskFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.owner')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ownerEmail }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.status')" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | code2Name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('actions')" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleSwitchStatus(row)">
            {{ row.status === '100801' ? $t('disable'): $t('enable') }}
          </el-button>
          <el-button type="warning" size="mini" @click="handleResetAppSecurity(row)">
            {{ $t('reset') }}
          </el-button>
          <el-button size="mini" @click="handleUpdate(row)">
            {{ $t('edit') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item :label="$t('app.appId')" prop="appId">
          <el-input v-model="temp.appId" disabled />
        </el-form-item>
        <el-form-item :label="$t('app.appSecurity')" prop="appSecurity">
          <el-input v-model="temp.appSecurity" disabled />
        </el-form-item>
        <el-form-item :label="$t('app.owner')" prop="owner">
          <el-input v-model="temp.ownerEmail" :placeholder="$t('app.ownerEmail')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, switchStatus, deleteApp, resetAppSecurity, createApp, updateApp } from '@/api/app'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getCodes } from '@/utils/dict'
import { uuidMask } from '@/utils/uuid'

export default {
  name: 'AppId',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      appStatuses: getCodes('1008'),
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        appId: undefined,
        status: undefined
      },
      temp: {
        id: undefined,
        ownerEmail: undefined,
        appId: undefined,
        appSecurity: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('edit'),
        create: this.$t('create')
      },
      rules: {
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.records
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm(this.$t('app.deleteAppWarning'), this.$t('warning'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        deleteApp(row.id).then(response => {
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.$message({
            message: this.$t('actionSuccessfully'),
            type: 'success'
          })
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        ownerEmail: undefined,
        appId: undefined,
        appSecurity: undefined
      }
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createApp(this.temp).then(data => {
            this.list.unshift(data)
            this.dialogFormVisible = false
            this._boxOfAppSecurity(data)
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.temp.appSecurity = uuidMask(this.temp.appSecurity)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateApp(tempData).then(data => {
            for (const v of this.list) {
              if (v.id === data.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, data)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: this.$t('success'),
              message: this.$t('updateSuccessfully'),
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleSwitchStatus(row) {
      this.$confirm(this.$t('updateStatusWarning'), this.$t('warning'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        switchStatus(row).then(data => {
          for (const v of this.list) {
            if (v.id === data.id) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, data)
              break
            }
          }
          this.$notify({
            title: this.$t('success'),
            message: this.$t('updateSuccessfully'),
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    handleResetAppSecurity(row) {
      this.$confirm(this.$t('app.resetAppSecurityWarning'), this.$t('warning'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        resetAppSecurity(row).then(data => {
          for (const v of this.list) {
            if (v.id === data.id) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, data)
              break
            }
          }
          this._boxOfAppSecurity(data)
        })
      })
    },
    _boxOfAppSecurity(data) {
      this.$confirm(`<p>App ID: <strong>${data.appId}</strong></p><p>App Security: <strong>${data.appSecurity}</strong></p>`, this.$t('app.keepAppSecurityWarning'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        dangerouslyUseHTMLString: true,
        type: 'prompt',
        center: true
      }).then(() => {
      })
    }
  }
}
</script>
