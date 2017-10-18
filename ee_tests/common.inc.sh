current_dir=$(readlink -f "${BASH_SOURCE[0]%/*}")

source "$current_dir/lib/core.inc.sh"
source "$current_dir/lib/logger.inc.sh"
unset current_dir
