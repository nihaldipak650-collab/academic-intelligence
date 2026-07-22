"""项目配置。

后续在此集中读取环境变量并定义默认配置。
"""

from pathlib import Path


# 项目根目录，供其他模块构造数据和提示词路径。
BASE_DIR = Path(__file__).resolve().parent
