import postcss, { Rule, AtRule, ChildNode, Root } from 'postcss';

export const mergeAdjacentMedia = postcss.plugin('postcss-merge-adjacent-media', () => (root: Root) => {
	root.walkAtRules((rule) => {
		if (rule.name !== 'media') {
			return;
		}

		const nextRule = getNextRule(rule);

		if (!nextRule || nextRule.type !== 'atrule') {
			return;
		}

		if (nextRule.params === rule.params) {
			nextRule.prepend(rule.nodes);
			rule.remove();
		}
	});
});

function getNextRule(rule: ChildNode): Rule | AtRule {
	const nextNode = rule.next();
	if (!nextNode) {
		return;
	}

	if (nextNode.type === 'atrule' || nextNode.type === 'rule') {
		return nextNode;
	}

	return getNextRule(nextNode);
}
