cmake_minimum_required(VERSION 3.15)
project(SystemReawakenCore VERSION 2.5 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

add_executable(reawaken_core
    src/main.cpp
)

# Optional WebAssembly Emscripten Target configuration
if(EMSCRIPTEN)
    set_target_properties(reawaken_core PROPERTIES
        LINK_FLAGS "-s WASM=1 -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']"
    )
endif()
