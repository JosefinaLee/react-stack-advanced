### React设计模式: 逻辑复用

#### INTRO

React编程中的一个核心思想就是组件化。React里，组件是代码复用的主要单元，基于组合的组件复用机制相当优雅。而对于更细粒度的逻辑（状态逻辑、行为逻辑等），复用起来却不那么容易，很难把状态逻辑拆出来作为一个可复用的函数或组件。
从React诞生到发展至今，关于逻辑复用的方案，社区和官方都给出了很多不同的方案。这里总结一下，在React中，逻辑代码复用的几种方案的实现及其各自的利弊。

* Mixin
* Higher-Order Components
* Render Props
* Hooks

* * *

#### Mixin

- Mixin使用混入的方式，将功能注入到原型对象中，来实现代码和逻辑的复用。
- 主要用来解决生命周期逻辑和状态逻辑的复用问题。
- 允许从外部扩展组件生命周期

```javascript
// 定义Mixin
var Mixin1 = {
  getMessage: function() {
    return 'hello world';
  }
};
var Mixin2 = {
  componentDidMount: function() {
    console.log('Mixin2.componentDidMount()');
  }
};

// 用Mixin来增强现有组件
var MyComponent = React.createClass({
  mixins: [Mixin1, Mixin2],
  render: function() {
    return <div>{this.getMessage()}</div>;
  }
});
```

##### 明显的缺陷

- 打破了原有组件的封装，对原有的对象造成污染
- Mixin 难以维护：Mixin 逻辑最后会被打平合并到一起，很难搞清楚一个 Mixin 的输入输出
- 可能会出现命名冲突的问题
- 增加复杂度
- ES6 不支持

所以，React v0.13.0 放弃了 Mixin（继承），转而走向HOC（组合）。
React v15.5.0正式废弃React.createClass() API，移至create-react-class，内置 Mixin 也一同成为历史。

* * *

#### HOC

> 高阶组件（HOC）是 React 中用于复用组件逻辑的一种高级技巧。HOC 自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式。

HOC概念类似于高阶函数，本质是一个`函数`，接受一个`组件`作为参数，经过装饰之后，返回一个新的`组件`。装饰的过程，就是将可复用的逻辑，附加到原有的组件上，可以是组件结构的扩展，也可以是功能的扩充。

```javascript

// 定义HOC
function HocAutoShow(Component) {

    return class AutoShow extends React.PureComponent {
        static propTypes = {
            showWhenScrollTo: PropTypes.number,
            onVisibilityChange: PropTypes.func,
        }

        static defaultProps = {
            showWhenScrollTo: 0,
            onVisibilityChange: _.noop
        }

        constructor(props) {
            super(props);
            this.state = {
                show: false,
            };
        }

        componentDidMount = async () => {
            window.addEventListener('scroll', this.handleScroll);
        }

        componentDidUpdate() {
            this.props.onVisibilityChange(this.state.show)
        }

        componentWillUnmount() {
            window.removeEventListener('scroll', this.handleScroll);
        }

        handleScroll = _.throttle(() => {
            const show = window.scrollY > this.props.showWhenScrollTo;
            if (show) {
                this.setState({ show: true });
            } else {
                this.setState({ show: false });
            }
        }, 50)


        render() {
            return <Component visible={this.state.show} {...this.props} />;
        }
    };
}

// 使用
    const HocIcon = HocAutoShow(FixedIcon)
    
    return (
        <HocIcon
            showWhenScrollTo={300}
            onVisibilityChange={handleVisibilityChange}
        />
    )

```

##### 优势

HOC模式在抽离公用逻辑的同时，减少对原有组件的侵入性，非常适合在开发过程中业务模块的封装与复用。HOC 模式下，外层组件通过 Props 影响内层组件的状态，而不是直接改变其 State

并且，对于可复用的状态逻辑，这份状态只维护在带状态的高阶组件中（相当于扩展 State 也有了组件作用域），不存在冲突和互相干扰的问题

最重要的，不同于 Mixin 的打平+合并，HOC 具有天然的层级结构（组件树结构），这种分解大大降低了复杂度


##### 缺陷

HOC 虽然没有那么多致命问题，但也存在一些小缺陷：

- Ref 传递问题：Ref 被隔断，只能手动向下传递
    `React.forwardRef` API 的出现缓解了这个问题
- 不够直接。我们从props中接受的数据，有时候不知道是从那个HOC传递过来的。虽然语义化的命名可能会解决这个问题，但是让规约来弥补设计方案的缺陷，本身就是不太合理的。
- Wrapper Hell：HOC 泛滥，出现 Wrapper Hell
    多层抽象同样增加了复杂度和理解成本，而 HOC 模式下没有很好的解决办法
    

* * *

#### Render Props

> 术语 “render prop” 是指一种在 React 组件之间使用一个值为函数的 prop 共享代码的简单技术

具有 render prop 的组件接受一个`函数`，该函数返回一个 `React元素`， 该组件调用它而不是实现自己的渲染逻辑。
更具体地说，render prop 是一个用于告知组件需要渲染什么内容的函数 prop。这项技术使我们共享行为非常容易。本质：子组件根据父组件调用`render prop函数`传入的参数动态决定渲染内容，这些参数可以是父组件的state/props等状态或函数等任何内容，实现了逻辑的传递和复用。
该方案也规避了上述提到的很多缺陷。

```javascript

// 定义接受render prop 的组件

class AutoShow extends React.PureComponent {
    static propTypes = {
        showWhenScrollTo: PropTypes.number,
        onVisibilityChange: PropTypes.func,
        children: PropTypes.func,
    }

    static defaultProps = {
        showWhenScrollTo: 0,
        onVisibilityChange: _.noop,
        children: () => null
    }

    constructor(props) {
        super(props);
        this.state = {
            show: false,
        };
    }

    componentDidMount = async () => {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate() {
        this.props.onVisibilityChange(this.state.show)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll = _.throttle(() => {
        const show = window.scrollY > this.props.showWhenScrollTo;
        if (show) {
            this.setState({show: true});
        } else {
            this.setState({show: false});
        }
    }, 50)


    render() {
        return this.props.children(this.state.show)
    }
}
    
// 使用
    <AutoShow
        showWhenScrollTo={200}
        onVisibilityChange={handleVisibilityChange}
    >
        {(visible) => <FixedIcon visible={visible}/>}
    </AutoShow>

```

* * *

#### HOC 与 Render Props 

本质上，二者都基于组件组合机制，Render Props 拥有与 HOC 一样的扩展能力
HOC 模式下通过 Wrapper 的render()建立组合关系
Render Props 模式下，组件是通过render()组合起来的
这使得Render Props 与 HOC 的相互转换也很容易

* * *

#### Hooks

HOC、Render Props、组件组合、Ref 传递……代码复用为什么这样复杂？
HOC、Render Props 等基于组件组合的方案，相当于先把要复用的逻辑**包装成组件**，再**利用组件复用机制**实现逻辑复用。自然就受限于组件复用，因而出现扩展能力受限、Ref 隔断、Wrapper Hell……等问题

那么，有没有一种简单直接的代码复用方式？

函数。将可复用逻辑抽离成函数应该是最直接、成本最低的代码复用方式。
但对于状态逻辑，仍然需要通过一些抽象模式才能实现复用。
这正是 Hooks 的思路：将函数作为最小的代码复用单元，同时内置一些模式以简化状态逻辑的复用

Hook 可以帮助你将状态逻辑从组件中抽离出来，在不需要改变组件DOM结构层次的情况下，实现逻辑复用。只共享数据处理逻辑，不会共享数据本身。

```javascript

// 自定义Hook
    function useAutoShow({showWhenScrollTo, onVisibilityChange}) {
        const [visible, setVisible] = useState(false);
    
        useEffect(() => {
    
            const handleScroll = _.throttle(() => {
                const show = window.scrollY > showWhenScrollTo;
                if (show) {
                    setVisible(true)
                } else {
                    setVisible(false)
                }
            }, 50)
    
            window.addEventListener('scroll', handleScroll);
    
            onVisibilityChange(visible);
    
            return () => {
                window.removeEventListener('scroll', handleScroll);
            }
        }, [visible]) // 第二个可选参数: 某些特定值在两次重渲染之间没有发生变化，React 跳过对 effect 的调用
    
        return visible;
    }

// 使用hook定义函数式组件 
    function FixedIconHooked(props){
        const visible = useAutoShow(props);
        return <FixedIcon visible={visible}/>
    }

// 使用
    <FixedIconHooked
        showWhenScrollTo={300}
        onVisibilityChange={handleVisibilityChange}
    />

```

##### 缺陷

Hooks 也并非完美，只是就目前而言，其缺点如下：

- 额外的学习成本（Functional Component 与 Class Component 之间的困惑）
- 写法上有限制（只在最顶层使用 Hook, 不能出现在条件、循环中）；只在 React 函数组件中调用 Hook
- 破坏了PureComponent、React.memo浅比较的性能优化效果（为了取最新的props和state，每次render()都要重新创建事件处函数）
- 内部实现上不直观（依赖一份可变的全局状态，不再那么“纯”）

* * *

#### THE END

严格来讲，Mixin、Render Props、HOC 等方案都只能算是在既有（组件机制的）游戏规则下探索出来的上层模式，并没有从根源上很好地解决组件间逻辑复用的问题，直到 Hooks 登上舞台。

比起上面提到的其它方案，Hooks 让组件内逻辑复用不再与组件复用捆绑在一起，是真正在从下层去尝试解决（组件间）细粒度逻辑的复用问题

此外，这种声明式逻辑复用方案将组件间的显式数据流与组合思想进一步延伸到了组件内，契合 React 理念

官方FAQ：
- Hook 会替代 render props 和高阶组件吗？
    通常，render props 和高阶组件只渲染一个子节点。我们认为让 Hook 来服务这个使用场景更加简单。这两种模式仍有用武之地，（例如，一个虚拟滚动条组件或许会有一个 renderItem 属性，或是一个可见的容器组件或许会有它自己的 DOM 结构）。但在大部分场景下，Hook 足够了，并且能够帮助减少嵌套。

官方表示并没有计划从React中移除class，但是更推荐在新代码中尝试`Hook`。

* * *

##### 参考文章

* [React组件间逻辑复用](https://cloud.tencent.com/developer/article/1444725)
* [React的演变--逻辑复用](https://blog.csdn.net/neoveee/article/details/87619175)
* [React中文网](https://react.docschina.org/)
